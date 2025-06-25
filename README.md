# React Chat 
This is a chat app designed to work on mobile web and desktop.
It's designed as an offline first chat client.

It supports the following
- supports an offline AI model trained to detect toxicity in messages, and filters out such messages in the ui.
- Emoji detection to style the app differently
- use of emoji text (eg: `:heart:`)
- store all chat in a local indexed db for offline retrieval of messages
- uses virtual scrolling from tanstack virtual to keep the chat client light with increased chat messages.
- supports time stamp display, and grouping of messages based on time intervals (eg: messages typed in succession are grouped together, while the rest are parted apart)

### Available Test Scripts

```bash
# Run tests once
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with UI mode
bun run test:ui

# Run tests with coverage report
bun run test:coverage
```

## Development

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Screenshots

<img width="867" alt="image" src="https://github.com/user-attachments/assets/a6828f9d-4731-4daa-8761-e00dcee8dc6a" />
<img width="873" alt="image" src="https://github.com/user-attachments/assets/d82b13aa-c373-4d1e-93e7-b37c5d26329e" />

Animated bounce and Emoji detection to render it differently

<img width="401" alt="image" src="https://github.com/user-attachments/assets/b6179398-6604-4b30-b9ca-add70cf87861" />

<img width="401" alt="image" src="https://github.com/user-attachments/assets/3e17b37a-ea1c-4973-a354-27347b616a9f" />

Loading state.

<img width="411" alt="image" src="https://github.com/user-attachments/assets/789f4203-de86-4c46-aeb6-1b82d4bf24a5" />

<img width="403" alt="image" src="https://github.com/user-attachments/assets/a17b6b70-420e-4e93-b73d-c1cacf6a2fa9" />
<img width="402" alt="image" src="https://github.com/user-attachments/assets/6148d4b5-f26b-4374-869a-c08eb99e8f32" />
<img width="407" alt="image" src="https://github.com/user-attachments/assets/254dfc0b-6398-4916-8166-1c15cff65466" />
<img width="400" alt="image" src="https://github.com/user-attachments/assets/fc171ac6-a3dc-4663-ba64-f9612d60d6bc" />
<img width="402" alt="image" src="https://github.com/user-attachments/assets/26336c14-e18d-45be-a471-b13878573e18" />
<img width="420" alt="image" src="https://github.com/user-attachments/assets/2e0b890e-0b94-40a3-88e5-8050c1214e3c" />
<img width="420" alt="IMG_7510" src="https://github.com/user-attachments/assets/f5809cfb-5960-4eee-94e2-d7ad38236779" />
<img width="420" alt="IMG_7509" src="https://github.com/user-attachments/assets/6a82b300-a446-49c4-86c5-0864acc40db7" />
<img width="398" alt="image" src="https://github.com/user-attachments/assets/ba90fe4e-7a80-4bcb-841e-39b1621e9050" />

## Run tests

```
npm test
```

## Run locally

```
 bun install
 bun dev
```
