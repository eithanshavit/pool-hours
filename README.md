# Pool Hours App

A Next.js web application that displays real-time pool hours from the Highlands Recreation District. The app scrapes the official pool website and shows current availability with a clean, modern interface.

## Features

- 🏊‍♂️ **Real-time Pool Status**: Shows if the pool is currently open or closed
- 📅 **Today's Schedule**: Displays all lap swim and recreational swim times for the current day
- 🎨 **Beautiful UI**: Clean, responsive design with color-coded status indicators
- 🔄 **Auto-refresh**: Updates every 5 minutes to keep information current
- 📱 **Mobile-friendly**: Optimized for all device sizes
- ⚡ **Fast Loading**: Built with Next.js for optimal performance

## Live Demo

Visit the live application to see pool hours in real-time.

## Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Web Scraping**: Axios, Cheerio
- **Time Handling**: Moment.js with timezone support
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pool-hours-app.git
cd pool-hours-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## How It Works

The application works by:

1. **Web Scraping**: The API route (`/api/pool-hours`) scrapes the official Highlands Recreation District website
2. **Data Parsing**: Extracts lap swim and recreational swim hours from HTML tables
3. **Time Processing**: Converts human-readable times to machine-readable timestamps
4. **Status Calculation**: Determines if the pool is currently open based on current time
5. **UI Display**: Presents the information in a user-friendly interface

## API Endpoint

The app provides a REST API endpoint:

- **GET** `/api/pool-hours`
- **Response**: JSON object containing pool hours, current status, and metadata

Example response:
```json
{
  "hours": [
    {
      "start": "2024-01-15T07:30:00.000Z",
      "end": "2024-01-15T11:00:00.000Z",
      "timezone": "America/Los_Angeles",
      "original": "7:30am - 11:00am",
      "type": "lap"
    }
  ],
  "prettified": "[Open] Lap 7:30am-11:00am / Rec 1:00pm-5:00pm",
  "isOpenNow": true,
  "error": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Highlands Recreation District for providing the pool schedule information
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ for the swimming community 
