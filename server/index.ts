/**
 * Csbox Cloud Academy - Express Backend Server
 *
 * Provides REST API endpoints for authentication, courses, enrollments,
 * certificates, audit logging, and authorization.
 *
 * Run with: tsx server/index.ts
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ---------------------------------------------------------------------------
// Authentication Middleware
// ---------------------------------------------------------------------------

function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void | Response {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded as { id: string; email: string; role: string };
    next();
  });
}

// ---------------------------------------------------------------------------
// Authorization Middleware (Role-based)
// ---------------------------------------------------------------------------

function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

function requirePermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    // Permission check would query user_permissions table in production
    // For now, role-based check is performed
    next();
  };
}

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Auth Routes
// ---------------------------------------------------------------------------

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'student' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    const existing = await pool.query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      `INSERT INTO profiles (email, password_hash, full_name, role, is_suspended, mfa_enabled, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, email, full_name, role, is_suspended, mfa_enabled, created_at`,
      [email, passwordHash, name, role, false, false]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES_IN }
    );

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.full_name, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, full_name, role, password_hash, is_suspended FROM profiles WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.is_suspended) {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES_IN }
    );

    // Update last login
    await pool.query('UPDATE profiles SET last_login = NOW() WHERE id = $1', [user.id]);

    res.json({
      user: { id: user.id, email: user.email, name: user.full_name, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };

    const result = await pool.query(
      'SELECT id, email, full_name, role FROM profiles WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = result.rows[0];

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out' });
});

// ---------------------------------------------------------------------------
// User Routes
// ---------------------------------------------------------------------------

app.get('/api/users', authenticateToken, requireRole('super_admin', 'admin'), async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, is_suspended, suspension_reason, last_login, mfa_enabled, created_at FROM profiles ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Users can only view their own profile unless admin/super_admin
    if (req.user?.role !== 'super_admin' && req.user?.role !== 'admin' && req.user?.id !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'SELECT id, email, full_name, role, is_suspended, last_login, mfa_enabled FROM profiles WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/users/:id/suspend', authenticateToken, requireRole('super_admin', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await pool.query(
      'UPDATE profiles SET is_suspended = $1, suspension_reason = $2, suspended_at = CASE WHEN $1 THEN NOW() ELSE NULL END WHERE id = $3',
      [true, reason || null, id]
    );

    res.json({ message: 'User suspended' });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/users/:id/unsuspend', authenticateToken, requireRole('super_admin', 'admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE profiles SET is_suspended = false, suspension_reason = NULL, suspended_at = NULL WHERE id = $1',
      [id]
    );

    res.json({ message: 'User unsuspended' });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Course Routes
// ---------------------------------------------------------------------------

app.get('/api/courses', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(e.id) as enrollment_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.is_archived = false
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/courses/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/courses', authenticateToken, requireRole('super_admin', 'admin'), async (req: Request, res: Response) => {
  try {
    const { title, slug, description, category, level, instructor_id } = req.body;

    const result = await pool.query(
      `INSERT INTO courses (slug, title, description, category, difficulty_level, instructor_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [slug, title, description, category, level, instructor_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Enrollment Routes
// ---------------------------------------------------------------------------

app.post('/api/enrollments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { course_id } = req.body;
    const learner_id = req.user?.id;

    if (!learner_id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await pool.query(
      `INSERT INTO enrollments (learner_id, course_id, enrolled_at, progress_percent, is_completed)
       VALUES ($1, $2, NOW(), 0, false)
       RETURNING *`,
      [learner_id, course_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/enrollments/my', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const learner_id = req.user?.id;
    if (!learner_id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await pool.query(`
      SELECT e.*, c.title as course_title, c.slug as course_slug
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.learner_id = $1
      ORDER BY e.enrolled_at DESC
    `, [learner_id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Certificate Routes
// ---------------------------------------------------------------------------

app.get('/api/certificates', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let query = 'SELECT * FROM certificates';
    const params: any[] = [];

    // Students can only see their own certificates
    if (req.user?.role === 'student') {
      query += ' WHERE learner_id = $1';
      params.push(req.user.id);
    }

    query += ' ORDER BY issued_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/certificates/verify/:hash', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM certificates WHERE verification_hash = $1',
      [req.params.hash]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Audit Log Routes
// ---------------------------------------------------------------------------

app.get('/api/audit-logs', authenticateToken, requireRole('super_admin', 'admin'), async (_req: Request, res: Response) => {
  try {
    const { entityType, severity, actorRole, search, page = 1, limit = 50 } = req.query;

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (entityType && entityType !== 'all') {
      query += ` AND entity_type = $${paramIndex++}`;
      params.push(entityType);
    }
    if (severity && severity !== 'all') {
      query += ` AND severity = $${paramIndex++}`;
      params.push(severity);
    }
    if (actorRole && actorRole !== 'all') {
      query += ` AND actor_role = $${paramIndex++}`;
      params.push(actorRole);
    }
    if (search) {
      query += ` AND (action ILIKE $${paramIndex++} OR actor_name ILIKE $${paramIndex++} OR details ILIKE $${paramIndex++})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, (Number(page) - 1) * Number(limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function logAuditEvent(
  actorId: string,
  actorName: string,
  actorRole: string,
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  severity: string = 'info',
  ipAddress: string = ''
): void {
  pool.query(
    `INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, entity_type, entity_id, details, severity, ip_address, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
    [actorId, actorName, actorRole, action, entityType, entityId, details, severity, ipAddress]
  ).catch(console.error);
}

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Csbox Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
