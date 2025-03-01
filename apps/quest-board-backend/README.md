# Quest Board Backend

The backend service for the Quest Board application, providing API endpoints for managing quests and user interactions.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- Jest (Testing)
- Morgan (Logging)
- Helmet (Security)
- CORS

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

The server will start on port 3001 (or the port specified in your .env file).

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Run linter
- `pnpm check-types` - Check TypeScript types

## API Endpoints

### Health Check
- GET `/health` - Check API health status

More endpoints will be added as the application grows.

## Project Structure

```
src/
├── config/       # Configuration files
├── controllers/  # Route controllers
├── middleware/   # Custom middleware
├── models/       # Data models
├── routes/       # API routes
└── index.ts      # Application entry point
```

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

MIT 