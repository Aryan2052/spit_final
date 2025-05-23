# CampusEvents - Event Management Platform

CampusEvents is a comprehensive event management platform designed to streamline the entire event planning and execution process. From event creation and management to PR marketing, audience engagement, analytics, and budget optimization, CampusEvents provides all the tools event organizers need in one place.

https://youtu.be/d5bNXB_Cshs
you can view the demo of the website on the above video.

## Features

### Event Management
- Create, edit, and delete events with details like name, description, date, location, image, and organizer
- View past events and use them as templates for new events
- AI-powered task generation for different teams (PR, Tech, Logistics, Creatives)
- Email task distribution to team members

### PR & Marketing
- Social media integration and campaign management
- Promotional content creation and scheduling
- Audience targeting and outreach strategies

### Audience Engagement
- Interactive feedback forms for event attendees
- Real-time messaging and communication
- Gamification features to increase participant engagement
- Challenges and rewards system

### Analytics
- Event performance metrics and insights
- Attendance tracking and participant behavior analysis
- ROI measurement and reporting

### Budget Optimization
- Budget planning and allocation
- Expense tracking and financial reporting
- Cost-saving recommendations

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- React Hook Form for form handling
- TailwindCSS for styling
- Shadcn UI components
- Lucide React for icons
- React Query for data fetching

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Google Generative AI integration for AI-powered features

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google Generative AI API key (for AI features)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd spit_final
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd backend
npm install
```

4. Create environment files
   
Create `.env` in the root directory:
```
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Create `.env` in the backend directory:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm start
```

2. Start the frontend development server
```bash
# From the root directory
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Register an account or login
2. Create a new event from the Event Management page
3. Use AI-generated tasks to assign work to different teams
4. Monitor event performance through the Analytics dashboard
5. Engage with participants through gamification features
6. Collect and review feedback from attendees

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
