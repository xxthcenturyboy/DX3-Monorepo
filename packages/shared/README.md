# Shared LIBS

- All packages in this directory are shared accross *ALL* apps, apis, web apps, mobile apps, whatever.
- __*Must*__ maintain agnostic javascript and not be node, react, or mobile specific

---

### TESTING

Runs all tests shared folder
```Bash
pnpm test:shared
```

Runs all tests shared folder and makes coverage reports
```Bash
pnpm test:shared:coverage
```

Run by specific module
```Bash
pnpm @dx3/encryption test
```
```Bash
pnpm @dx3/models-shared test
```
```Bash
pnpm @dx3/test-data test
```
```Bash
pnpm @dx3/utils-shared test
```
