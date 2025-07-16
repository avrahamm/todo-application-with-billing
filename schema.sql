-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for todos
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policy for selecting todos (users can only see their own todos)
CREATE POLICY "Users can view their own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy for inserting todos (users can only insert their own todos)
CREATE POLICY "Users can insert their own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy for updating todos (users can only update their own todos)
CREATE POLICY "Users can update their own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy for deleting todos (users can only delete their own todos)
CREATE POLICY "Users can delete their own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE
);

-- Create RLS policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for selecting subscriptions (users can only see their own subscriptions)
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting subscriptions (only service role can insert)
CREATE POLICY "Service role can insert subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating subscriptions (only service role can update)
CREATE POLICY "Service role can update subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to check todo limits
CREATE OR REPLACE FUNCTION check_todo_limit()
RETURNS TRIGGER AS $$
DECLARE
  todo_count INTEGER;
  is_pro BOOLEAN;
  subscription_count INTEGER;
BEGIN
  -- Count user's todos
  SELECT COUNT(*) INTO todo_count FROM todos WHERE user_id = NEW.user_id;
  
  -- Check if user has an active subscription
  SELECT COUNT(*) INTO subscription_count FROM subscriptions 
  WHERE user_id = NEW.user_id AND status = 'active';
  
  is_pro := subscription_count > 0;
  
  -- Apply limits based on user status
  IF NEW.user_id IS NULL AND todo_count >= 3 THEN
    RAISE EXCEPTION 'Unregistered users can create a maximum of 3 todos';
  ELSIF NEW.user_id IS NOT NULL AND NOT is_pro AND todo_count >= 5 THEN
    RAISE EXCEPTION 'Free users can create a maximum of 5 todos. Upgrade to PRO for unlimited todos.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for todo limit check
CREATE TRIGGER check_todo_limit_trigger
BEFORE INSERT ON todos
FOR EACH ROW
EXECUTE FUNCTION check_todo_limit();