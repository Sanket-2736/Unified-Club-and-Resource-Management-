# Clubs Management System - Backend

A comprehensive backend API for managing college clubs, events, memberships, and user interactions. Built with Express.js and MongoDB, this system provides features for club administration, event organization, resource management, and attendance tracking.

## 🎯 Features

### Club Management
- Create and manage multiple clubs with different categories (technical, cultural, sports, academic, arts, etc.)
- Club profiles with detailed information (mission statements, taglines, descriptions)
- Media management (logos, cover images, gallery uploads) via Cloudinary
- Social links and contact information
- Club membership applications and approvals
- Faculty coordinators for club oversight

### Event Management
- Comprehensive event creation and scheduling
- Multiple event types (workshops, seminars, competitions, conferences, hackathons, etc.)
- Support for physical, virtual, and hybrid events
- Event registration and capacity management
- Event status tracking (draft, approved, in_progress, completed, cancelled)
- Event rescheduling with approval workflows
- Event media and documentation uploads
- Certificate generation for event attendees

### User Management
- Multi-role support (super_admin, admin, organizer, participant, guest, faculty_coordinator)
- User authentication with JWT
- Profile management with academic details
- Event attendance tracking
- Activity history and engagement metrics
- Password security with bcryptjs

### Attendance & Tracking
- Mark attendance for events
- Attendance history per user
- Certificate issuance for completed events
- Participant feedback collection

### Resource Management
- Manage club resources (books, equipment, materials)
- Resource allocation and tracking
- Resource request workflows
- Generate resource letters/documents

### Additional Features
- Rate limiting for API security
- Email validation utilities
- File upload handling with multer
- PDF generation for certificates and letters
- Secure JWT-based authentication

## 📁 Project Structure

```
backend/
├── controllers/           # Route handlers and business logic
│   ├── admin.controller.js
│   ├── auth.controller.js
│   ├── club.controller.js
│   ├── club.admin.controller.js
│   ├── club.faculty.controller.js
│   ├── event.controller.js
│   ├── event.admin.controller.js
│   ├── event.media.controller.js
│   ├── attendance.controller.js
│   ├── user.controller.js
│   ├── resource.controller.js
│   ├── resourceLetter.controller.js
│   └── feedback.controller.js
├── models/                # MongoDB schemas
│   ├── User.js
│   ├── Club.js
│   ├── Event.js
│   ├── EventRegistration.js
│   ├── ClubMembershipApplication.js
│   ├── Resources.js
│   └── Notifications.js
├── middlewares/           # Express middleware
│   └── auth.middleware.js
├── utils/                 # Utility functions
│   ├── cloudinary.js      # Image/media upload service
│   ├── jwt.js             # JWT token management
│   ├── password.js        # Password hashing & validation
│   ├── token.js           # Token utilities
│   ├── emailValidator.js  # Email validation
│   └── multer.js          # File upload configuration
├── package.json           # Project dependencies
├── server.js              # Express server setup
└── .env                   # Environment variables
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for media uploads)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clubs/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root of the backend directory with:
   ```
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret-key>
   CLOUDINARY_NAME=<your-cloudinary-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000` (or your configured PORT).

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | Latest | Web framework |
| mongoose | Latest | MongoDB object modeling |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| express-rate-limit | ^8.2.1 | API rate limiting |
| pdfkit | ^0.17.2 | PDF generation |
| cloudinary | Latest | Media upload service |
| multer | Latest | File upload handling |
| dotenv | Latest | Environment configuration |

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for secure authentication:

- Users login with email and password
- JWT tokens are issued upon successful authentication
- Tokens must be included in request headers as: `Authorization: Bearer <token>`
- Auth middleware validates tokens on protected routes

### User Roles & Permissions

- **super_admin**: Full system access, user and role management
- **admin**: Administrative functions, system configuration
- **organizer**: Can create and manage clubs and events
- **faculty_coordinator**: Oversees club activities, approves resource requests
- **participant**: Can register for events, join clubs
- **guest**: Limited access to public event information

## 🔗 Core Models

### User
- Authentication credentials and profile information
- Academic details (department, year of study, etc.)
- Event attendance history
- Club memberships and roles
- Activity tracking

### Club
- Basic information (name, description, mission)
- Categories and tags
- Media (logo, cover image, gallery)
- Members and membership applications
- Associated events
- Contact information and social links

### Event
- Event details and scheduling
- Organizer and collaborator information
- Venue information (physical/virtual/hybrid)
- Registration and capacity management
- Media and documentation
- Status tracking
- Feedback and evaluation

### EventRegistration
- User-event enrollment tracking
- Registration status
- Attendance status
- Certificate issuance details

### Resources
- Club resources inventory
- Resource details and availability
- Allocation and request tracking
- Resource history

## 📡 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token

### Clubs
- `GET /api/clubs` - List all clubs
- `POST /api/clubs` - Create new club
- `GET /api/clubs/:clubId` - Get club details
- `PUT /api/clubs/:clubId` - Update club profile
- `POST /api/clubs/:clubId/media` - Upload club media
- `POST /api/clubs/:clubId/members` - Add club member

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event
- `GET /api/events/:eventId` - Get event details
- `PUT /api/events/:eventId` - Update event
- `POST /api/events/:eventId/register` - Register for event
- `POST /api/events/:eventId/attendance` - Mark attendance

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update profile
- `GET /api/users/:userId/events` - Get user's events

### Resources
- `GET /api/resources` - List resources
- `POST /api/resources` - Create resource
- `POST /api/resources/:resourceId/request` - Request resource
- `GET /api/resources/letter/:resourceId` - Generate resource letter

## 🔄 Workflows

### Event Creation & Approval
1. Organizer creates event draft
2. Event submitted for admin approval
3. Admin reviews and approves/rejects
4. Approved event goes live for registration
5. Users register for the event
6. Event status updates to in_progress on start date
7. Attendance marked during event
8. Certificates generated upon completion

### Club Membership Application
1. User applies to join club
2. Club admin reviews application
3. Application approved/rejected
4. Member added to club with assigned role
5. Member can participate in club events

### Resource Request
1. Club requests resource from pool
2. Faculty coordinator reviews request
3. Resource allocated if available
4. Resource letter generated
5. Usage tracked and logged

## 🛡️ Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Stateless token-based authentication
- **Rate Limiting**: Protection against abuse
- **Email Validation**: Input validation for email fields
- **Environment Variables**: Sensitive data stored securely
- **Middleware Protection**: Auth middleware on protected routes

## 📝 Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## 🧪 Testing

To run tests (when available):
```bash
npm test
```

## 📋 Future Enhancements

- [ ] Add unit and integration tests
- [ ] Implement email notifications
- [ ] Add analytics dashboard
- [ ] Event analytics and reporting
- [ ] Club performance metrics
- [ ] Automated reminder system
- [ ] Advanced search and filtering
- [ ] WebSocket support for real-time updates

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

ISC License - See LICENSE file for details

## 👥 Authors

- CSE Club Management Team

## 📞 Support

For support, please contact the development team or create an issue in the repository.

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Mongoose Guide](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Cloudinary API Docs](https://cloudinary.com/documentation/cloudinary_api)

---

**Last Updated**: February 2026
