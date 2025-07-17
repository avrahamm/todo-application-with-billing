-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
