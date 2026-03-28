# Supabase 数据库设计

## 数据库概览

基于产品2（成长日记+计划系统）的需求，设计以下核心表：

```
┌─────────────────────────────────────────────────┐
│              Evolveme Growth DB                   │
├─────────┬─────────────┬─────────────┬───────────┤
│  用户层  │   日记层     │   计划层     │  系统层   │
├─────────┼─────────────┼─────────────┼───────────┤
│profiles │mood_checks  │plans        │tags       │
│settings │diaries      │milestones   │plan_tags  │
│streaks  │diary_tags   │tasks        │diary_tags │
│         │diary_photos │             │           │
└─────────┴─────────────┴─────────────┴───────────┘
```

---

## 表结构详细设计

### 1. profiles（用户档案）

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  timezone      TEXT DEFAULT 'UTC',
  locale        TEXT DEFAULT 'en',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**RLS 策略：**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的 profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 用户只能更新自己的 profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

### 2. mood_checks（心情打卡）

```sql
CREATE TABLE mood_checks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood        SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  -- 1:😢 2:😔 3:😐 4:🙂 5:😄
  note        TEXT,
  checked_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, DATE(checked_at))
  -- 每天只能打一次卡
);

CREATE INDEX idx_mood_checks_user_date ON mood_checks(user_id, DATE(checked_at) DESC);
CREATE INDEX idx_mood_checks_user_month ON mood_checks(user_id, DATE_TRUNC('month', checked_at));
```

**RLS 策略：**
```sql
ALTER TABLE mood_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own mood checks"
  ON mood_checks FOR ALL
  USING (auth.uid() = user_id);
```

---

### 3. diaries（日记）

```sql
CREATE TABLE diaries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  mood        SMALLINT CHECK (mood BETWEEN 1 AND 5),
  is_bookmarked BOOLEAN DEFAULT FALSE,
  word_count  INT GENERATED ALWAYS AS (LENGTH(content)) STORED,
  diary_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diaries_user_date ON diaries(user_id, diary_date DESC);
CREATE INDEX idx_diaries_user_bookmark ON diaries(user_id, is_bookmarked) WHERE is_bookmarked = TRUE;
CREATE INDEX idx_diaries_user_search ON diaries USING GIN(to_tsvector('english', title || ' ' || content));
```

**RLS 策略：**
```sql
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own diaries"
  ON diaries FOR ALL
  USING (auth.uid() = user_id);
```

---

### 4. diary_tags（日记标签关联）

```sql
CREATE TABLE diary_tags (
  diary_id    UUID NOT NULL REFERENCES diaries(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (diary_id, tag_id)
);

ALTER TABLE diary_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own diary tags"
  ON diary_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM diaries WHERE diaries.id = diary_tags.diary_id AND diaries.user_id = auth.uid()
    )
  );
```

---

### 5. diary_photos（日记图片）

```sql
CREATE TABLE diary_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_id    UUID NOT NULL REFERENCES diaries(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- Supabase Storage 路径
  order_index SMALLINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diary_photos_diary ON diary_photos(diary_id, order_index);

ALTER TABLE diary_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own diary photos"
  ON diary_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM diaries WHERE diaries.id = diary_photos.diary_id AND diaries.user_id = auth.uid()
    )
  );
```

---

### 6. plans（计划）

```sql
CREATE TABLE plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT DEFAULT '',
  icon          TEXT DEFAULT '🎯', -- emoji icon
  color         TEXT DEFAULT '#3B82F6',
  status        TEXT NOT NULL DEFAULT 'active' 
                CHECK (status IN ('active', 'completed', 'archived', 'paused')),
  progress      DECIMAL(5,2) DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  start_date    DATE,
  due_date      DATE,
  repeat_type   TEXT DEFAULT 'none'
                CHECK (repeat_type IN ('none', 'daily', 'weekly', 'monthly', 'custom')),
  repeat_config JSONB DEFAULT '{}', -- 自定义重复配置
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_user_status ON plans(user_id, status, sort_order);
CREATE INDEX idx_plans_user_due ON plans(user_id, due_date) WHERE status = 'active';
```

**RLS 策略：**
```sql
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own plans"
  ON plans FOR ALL
  USING (auth.uid() = user_id);
```

---

### 7. milestones（里程碑）

```sql
CREATE TABLE milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_completed BOOLEAN DEFAULT FALSE,
  due_date    DATE,
  sort_order  INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_plan ON milestones(plan_id, sort_order);
```

**RLS 策略：**
```sql
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own milestones"
  ON milestones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM plans WHERE plans.id = milestones.plan_id AND plans.user_id = auth.uid()
    )
  );
```

---

### 8. tasks（每日任务）

```sql
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id     UUID REFERENCES plans(id) ON DELETE SET NULL, -- 可关联计划，也可独立
  title       TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  task_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  priority    TEXT DEFAULT 'medium' 
              CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  sort_order  INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_date ON tasks(user_id, task_date DESC, sort_order);
CREATE INDEX idx_tasks_plan ON tasks(plan_id) WHERE plan_id IS NOT NULL;
```

**RLS 策略：**
```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);
```

---

### 9. tags（标签字典）

```sql
CREATE TABLE tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT DEFAULT '#3B82F6',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tags"
  ON tags FOR ALL
  USING (auth.uid() = user_id);
```

---

### 10. streaks（连续打卡记录）

```sql
CREATE TABLE streaks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak  INT DEFAULT 0,
  longest_streak  INT DEFAULT 0,
  last_check_date DATE,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own streaks"
  ON streaks FOR ALL
  USING (auth.uid() = user_id);
```

---

## ER 关系图

```
auth.users (Supabase Auth)
    │
    ├── 1:1 ── profiles
    ├── 1:1 ── streaks
    ├── 1:N ── mood_checks
    ├── 1:N ── diaries ──┬── N:M ── tags (via diary_tags)
    │                     └── 1:N ── diary_photos
    ├── 1:N ── plans ──┬── 1:N ── milestones
    │                   └── 1:N ── tasks (optional)
    ├── 1:N ── tasks (independent)
    └── 1:N ── tags
```

---

## Storage Buckets

```sql
-- 创建日记图片存储桶
INSERT INTO storage.buckets (id, name, public) 
VALUES ('diary-photos', 'diary-photos', false);

-- 存储桶策略：用户只能管理自己的图片
CREATE POLICY "Users can upload own diary photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'diary-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own diary photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'diary-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own diary photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'diary-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

**图片存储路径规则：**
```
diary-photos/{user_id}/{diary_id}/{timestamp}_{random}.jpg
```

---

## TypeScript 类型定义

数据库设计对应的 TypeScript 类型定义位于：
`src/types/database.ts`（将在 V1.0.0.1 中创建）

---

## 部署方式

将此文件中的 SQL 按顺序在 Supabase SQL Editor 中执行。
推荐使用 Supabase Migrations 功能进行版本化管理。
