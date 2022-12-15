import path from "path"

// config used by server side only
const dbHost = process.env.DB_HOST || "127.0.0.1"
const dbPort = process.env.DB_PORT || 27017
const dbName = process.env.DB_NAME || "sartar"
const dbUser = process.env.DB_USER || ""
const dbPass = process.env.DB_PASS || ""
const dbCred =
  dbUser.length > 0 || dbPass.length > 0 ? `${dbUser}:${dbPass}@` : ""

const dbUrl =
  process.env.DB_URL ||
  `mongodb://${dbCred}${dbHost}:${dbPort}/${dbName}?authSource=admin`

const PORT = process.env.PORT || 8080
const API_URL = process.env.API_URL || "127.0.0.1:8080"
const NODE_ENV = process.env.NODE_ENV || "development"
const HOST = process.env.HOST || "localhost"
const StripeSecret =
  "sk_test_51JQC6bHmCtaUBEbYnNjt9ebHFdJsmqnLshOj0QwHYqWQuH2kUsIz1AaW57tSbskeRV4CNCTrRKbbFmbhfMmeKnq8003yhN3mMR"
const StripePublic =
  "pk_test_51JQC6bHmCtaUBEbYy8q7YMy1wqcTyqOtCdQTvKWgRU6REIMaoDxbQk7vrFd3DoxJQo0Dr4BIQ5rUHBrEYLK13ynf00BKUKwbeO"

const settings = {
  STR_SEC: StripeSecret,
  STR_PUB: StripePublic,
  API_URL,
  ENV: NODE_ENV,
  PORT,
  HOST,
  DOCS_URL: API_URL,
  MOODLE_TOKEN_LENGTH: 26,
  TOKEN_LENGTH: 64,
  TOKEN: {
    RANDOM_BYTE_LENGTH: 32,
  },

  // MongoDB URL
  MONGODB: {
    URL: dbUrl,
    OPTS: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  CORS_OPTS: {
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
  },

  SALT_FACTOR: 12,
  SALT_LENGTH: 10,
  errorResponse: {
    userNameEmpty: {
      code: 700,
      msg: "Username should not be empty",
    },
    userNameEmail: {
      code: 701,
      msg: "Username should be valid email",
    },
    passwordEmpty: {
      code: 702,
      msg: "Password should not be empty",
    },
    passwordLength: {
      code: 703,
      msg: "6 to 20 characters required",
    },
  },

  // used by Store (server side)
  apiBaseUrl: `http://localhost:3001/api/v1`,

  // used by Store (server and client side)
  ajaxBaseUrl: `http://localhost:3001/ajax`,

  // Access-Control-Allow-Origin
  storeBaseUrl: `http://localhost:3000`,

  // used by API
  adminLoginUrl: "/admin/login",

  apiListenPort: 3001,
  storeListenPort: PORT,

  // used by API
  mongodbServerUrl: dbUrl,

  // your shop smtp settings
  smtpServer: {
    host: "",
    port: 465,
    secure: true,
    user: "",
    pass: "",
    fromName: "Cezerin",
    fromAddress: "vam@test.com",
  },
  // key to sign tokens
  jwtSecretKey: "-", // must change on .env file as well

  // key to sign store cookies
  cookieSecretKey: "-",

  // path to uploads
  categoriesUploadPath: "public/content/images/categories",
  productsUploadPath: "public/content/images/products",
  filesUploadPath: "public/content",
  themeAssetsUploadPath: "theme/assets/images",

  // url to uploads
  categoriesUploadUrl: "/images/categories",
  productsUploadUrl: "/images/products",
  filesUploadUrl: "",
  themeAssetsUploadUrl: "/assets/images",

  MEDIA: {
    FILE_SIZE: 1 * 1024 * 1024, // 2MB,
    URL: `${API_URL}/public/sartor/media`,
    FILES_FOLDER: path.resolve(process.cwd(), "./public/sartor/media"),
    UPLOADES: path.resolve(process.cwd(), "./public/sartor/uploads"),
    UPLOADS: path.resolve(process.cwd(), "./public/sartor/uploads"),
  },

  AGENT_COMMISSION: {
    RATE: 0.2,
    PAYMENT: 10,
    ROUND: 2,
  },

  COMPANY_COMMISSION: {
    RATE: 0.2,
  },

  // store UI language
  language: "en",

  // used by API
  orderStartNumber: 1000,

  // cost factor, controls how much time is needed to calculate a single BCrypt hash
  // for production: recommended salRounds > 12
  saltRounds: process.env.SALT_ROUNDS || 12,

  developerMode: true,
}

export default settings
