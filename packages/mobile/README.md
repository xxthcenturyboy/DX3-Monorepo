# Mobile

Mobile app in React Native Expo

---

## Dev
Run Mobile App
```Bash
pnpm dev:mobile
```

Run and Watch API (starts in container - run each command in its own terminal)
```Bash
make api-watch
make api-start
```

Run Mobile App
```Bash
pnpm --filter @dx3/mobile start
```

---

## Testing

Runs all mobile tests
```Bash
pnpm --filter @dx3/mobile test
pnpm --filter @dx3/mobile test:coverage
```

Run tests for a specific module
```Bash
pnpm --filter @dx3/mobile test --testPathPattern="app/"
```

Runs a specific test
```Bash
pnpm --filter @dx3/mobile test --testPathPattern="app/App.spec"
```
