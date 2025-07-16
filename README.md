# Todo App with Billing

A todo list application with user authentication and subscription billing
using Supabase and Stripe.

## Features

- Create, read, update, and delete todos
- User authentication (sign up, sign in, sign out)
- Todo limits based on user status:
  - Unregistered users: 3 todos max
  - Registered users: 5 todos max
  - PRO users: Unlimited todos
- Subscription management with Stripe
- Responsive design

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Supabase (Authentication and Database)
- Stripe (Billing)
- Zustand (State Management)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   cp .env.example .env
   ```
3. Update the `.env` file with your Supabase and Stripe credentials
4. (Optional) Customize the application port by changing 
the `PORT` environment variable (default is 3000)

### Database Setup

1. Create a new Supabase project
2. Run the SQL commands in `schema.sql` in the Supabase SQL editor
to set up the database schema

### Stripe Setup

1. Create a Stripe account
2. Create a subscription product with a price of $2/month
3. Update the `.env` file with your Stripe credentials and price ID
4. Set up a webhook in your Stripe dashboard to point to `/api/webhooks/stripe` with the following events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:PORT](http://localhost:PORT) with your browser to see the result,
where PORT is the value you set in the .env file (default is 3000).

## Usage

### Authentication

- Click "Sign Up" to create a new account
- Click "Sign In" to log in with an existing account
- Click "Sign Out" to log out

### Todo Management

- Add new todos using the form at the top of the todo list
- Check/uncheck todos to mark them as completed/incomplete
- Delete todos using the delete button

### Subscription

- Click "Upgrade to PRO" to subscribe to the PRO plan
- PRO users have unlimited todos

## License

MIT
