import { User, Course, Enrollment, Certificate, AuditLog, Organization, SupportTicket, LearningPath, AssignmentSubmission, QuizAttempt } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_super_admin',
    name: 'Dr. Sarah Al-Mansoor',
    email: 'sarah.admin@csbox.dev',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'super_admin',
    isSuspended: false,
    lastLogin: '2026-10-15T08:12:00Z',
    mfaEnabled: true,
    preferences: {
      language: 'en',
      emailNotifications: true,
      smsNotifications: true,
    },
  },
  {
    id: 'usr_admin',
    name: 'Elena Rostova, CISSP',
    email: 'elena.rostova@csbox.dev',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    isSuspended: false,
    lastLogin: '2026-10-15T04:22:00Z',
    mfaEnabled: true,
    preferences: {
      language: 'en',
      emailNotifications: true,
      smsNotifications: false,
    },
  },
  {
    id: 'usr_student_1',
    name: 'Alexandria Miller',
    email: 'alex.miller@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'student',
    isSuspended: false,
    lastLogin: '2026-10-15T05:10:00Z',
    mfaEnabled: false,
    preferences: {
      language: 'en',
      emailNotifications: true,
      smsNotifications: false,
    },
  },
  {
    id: 'usr_student_2',
    name: 'James Chen',
    email: 'j.chen@student.university.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'student',
    isSuspended: false,
    lastLogin: '2026-10-14T16:00:00Z',
    mfaEnabled: false,
    preferences: {
      language: 'en',
      emailNotifications: true,
      smsNotifications: false,
    },
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs_sec_01',
    slug: 'network-security-zero-trust',
    title: 'Network Security Fundamentals & Zero Trust Architecture',
    subtitle: 'Master enterprise perimeter defense, micro-segmentation, identity-aware proxies, and zero trust policies.',
    description: 'A comprehensive, defense-in-depth course covering modern enterprise security. You will learn to transition legacy perimeter networks to Zero Trust Network Architecture (ZTNA), configure software-defined perimeters, automate incident response, and enforce strict identity-driven authorization.',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    category: 'Cybersecurity',
    level: 'Advanced',
    language: 'English',
    estimatedHours: 24,
    price: 189,
    isFree: false,
    tags: ['Zero Trust', 'ZTNA', 'Firewalls', 'SIEM', 'Defense in Depth', 'SOC'],
    learningObjectives: [
      'Design software-defined perimeters and micro-segmentation policies',
      'Implement Identity-Aware Proxies (IAP) and mutual TLS (mTLS) enforcement',
      'Architect robust defense-in-depth strategies compliant with NIST SP 800-207',
      'Deploy continuous authentication and behavioral anomaly detection engines'
    ],
    prerequisites: [
      'Working knowledge of TCP/IP, DNS, and TLS handshakes',
      'Basic familiarity with Linux command-line and cloud networking concepts'
    ],
    instructorId: 'usr_instructor_1',
    instructorName: 'Elena Rostova, CISSP',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    instructorBio: 'Elena is a Principal Cybersecurity Architect with 14 years of experience hardening enterprise infrastructure for Fortune 500 banks and defense contractors.',
    activeVersion: '1.2',
    enrollmentCount: 1420,
    rating: 4.9,
    reviewCount: 312,
    versions: [
      {
        version: '1.2',
        status: 'published',
        createdAt: '2026-09-01T10:00:00Z',
        updatedAt: '2026-10-01T15:30:00Z',
        publishedAt: '2026-10-02T09:00:00Z',
        changelog: 'Added NIST 800-207 Zero Trust compliance lab and updated TLS 1.3 protocol walkthrough.',
        modules: [
          {
            id: 'mod_1',
            title: 'Foundations of Zero Trust & Identity Verification',
            description: 'Deconstruct the castle-and-moat perimeter paradigm and understand the core tenants of Zero Trust.',
            order: 1,
            lessons: [
              {
                id: 'les_1_1',
                title: 'The Death of the Traditional Perimeter',
                durationMinutes: 18,
                type: 'video',
                order: 1,
                content: {
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                  videoDuration: '18:24',
                  textBody: `### Overview: Beyond the Castle and Moat\n\nFor decades, enterprise security relied on the 'castle-and-moat' architecture: trust everything inside the firewall, verify only what comes from the outside. \n\nModern distributed workforces, multi-cloud deployments, and advanced persistent threats have rendered this assumption dangerous.\n\n#### Core Tenets of Zero Trust (NIST SP 800-207):\n1. **All data sources and computing services are considered resources**\n2. **All communication is secured regardless of network location**\n3. **Access to individual enterprise resources is granted on a per-session basis**\n4. **Access is determined by dynamic policy** — including client identity, application state, and device telemetry\n5. **All resource authentication and authorization are dynamic and strictly enforced** before access is allowed.`
                },
                resources: [
                  { id: 'res_1', title: 'NIST SP 800-207 Zero Trust Architecture Whitepaper.pdf', type: 'pdf', url: '#', size: '2.4 MB' },
                  { id: 'res_2', title: 'Perimeter Migration Strategy Checklist.pdf', type: 'pdf', url: '#', size: '820 KB' }
                ]
              },
              {
                id: 'les_1_2',
                title: 'Mutual TLS (mTLS) Handshake & Cryptographic Proofs',
                durationMinutes: 25,
                type: 'text',
                order: 2,
                content: {
                  textBody: `### Cryptographic Verification: Mutual TLS Deep Dive\n\nWhile standard HTTPS only validates the server identity to the client, Zero Trust micro-segmentation demands **Mutual TLS (mTLS)**, where both parties present and validate X.509 certificates.\n\n\`\`\`text\nClient                                                 Server\n  |                                                      |\n  | -------------- ClientHello (CipherSuites) ----------> |\n  | <------------- ServerHello (Cert + CertRequest) ---- |\n  |                                                      |\n  | -------------- ClientCertificate + Finished --------> |\n  | <------------- Finished (Encrypted Handshake) ------ |\n  |                                                      |\n  | <============ Encrypted Bidirectional Pipe ========> |\n\`\`\`\n\n#### Practical Takeaway:\nNever rely solely on IP whitelisting inside your cluster. Pod-to-pod and service-to-service communication must validate mTLS SPIFFE/SPIRE identity tokens to prevent lateral movement after an initial node compromise.`
                }
              },
              {
                id: 'les_1_3',
                title: 'Interactive Knowledge Check: Zero Trust Principles',
                durationMinutes: 15,
                type: 'quiz',
                order: 3,
                content: {
                  quiz: {
                    id: 'qz_sec_01',
                    title: 'Zero Trust Architecture Competency Exam',
                    description: 'Test your understanding of perimeter elimination, mTLS, and dynamic policy engines.',
                    timeLimitMinutes: 15,
                    passThresholdPercent: 75,
                    maxAttempts: 3,
                    questions: [
                      {
                        id: 'q1',
                        prompt: 'Under NIST SP 800-207 guidelines, which of the following is an invalid assumption in a Zero Trust Network?',
                        options: [
                          'Internal network traffic is inherently trusted because it originates behind the corporate firewall.',
                          'Access to resources is evaluated on a per-session basis rather than persistent privilege.',
                          'Device health telemetry must be continuously evaluated during an active session.',
                          'Data in transit must be encrypted both across public networks and inside private data centers.'
                        ],
                        correctOptionIndex: 0,
                        explanation: 'Zero Trust explicitly dictates that internal network location provides zero implicit trust. All traffic must be authenticated and authorized regardless of source.',
                        points: 10
                      },
                      {
                        id: 'q2',
                        prompt: 'What distinguishes mutual TLS (mTLS) from traditional server-authenticated TLS?',
                        options: [
                          'mTLS uses symmetric keys during the entire handshake rather than public-key cryptography.',
                          'mTLS requires the client to present a cryptographic certificate verified against a trusted Certificate Authority (CA).',
                          'mTLS does not encrypt the payload data, only the headers.',
                          'mTLS is only supported on IPv6 networks.'
                        ],
                        correctOptionIndex: 1,
                        explanation: 'mTLS enforces bidirectional authentication: both client and server authenticate each other using cryptographic certificates.',
                        points: 10
                      },
                      {
                        id: 'q3',
                        prompt: 'Which component is responsible for making the ultimate access decision in a Zero Trust control plane?',
                        options: [
                          'Policy Enforcement Point (PEP)',
                          'Policy Decision Point (PDP)',
                          'Network Address Translator (NAT)',
                          'Dynamic Host Configuration Protocol (DHCP)'
                        ],
                        correctOptionIndex: 1,
                        explanation: 'The PDP (Policy Decision Point) evaluates context, identity, and behavioral telemetry to decide whether access should be granted, which the PEP then enforces.',
                        points: 10
                      }
                    ]
                  }
                }
              }
            ]
          },
          {
            id: 'mod_2',
            title: 'Micro-segmentation & Software-Defined Perimeters',
            description: 'Practical implementation of software-defined boundaries and container network security policies.',
            order: 2,
            lessons: [
              {
                id: 'les_2_1',
                title: 'Configuring Calico Network Policies for Kubernetes',
                durationMinutes: 30,
                type: 'practical',
                order: 1,
                content: {
                  practicalTasks: [
                    { id: 't1', description: 'Inspect default allow-all pod networking policy in your staging cluster', completed: true },
                    { id: 't2', description: 'Create default-deny ingress and egress NetworkPolicy manifest', completed: false },
                    { id: 't3', description: 'Define namespace-scoped ingress rule restricted to frontend service accounts', completed: false },
                    { id: 't4', description: 'Verify network drop logs in Prometheus/Grafana security dashboard', completed: false }
                  ],
                  textBody: `### Lab Objective:\nPrevent lateral pod traversal by applying strict micro-segmentation in your Kubernetes clusters using Kubernetes standard NetworkPolicies and Calico CNI.\n\nReview the checklist above and mark each milestone as you complete your deployment.`
                }
              },
              {
                id: 'les_2_2',
                title: 'Capstone Security Architecture Audit Report',
                durationMinutes: 45,
                type: 'assignment',
                order: 2,
                content: {
                  assignment: {
                    id: 'asg_sec_01',
                    title: 'Enterprise Zero Trust Migration Assessment Report',
                    instructions: 'Draft an architectural proposal for transitioning a legacy 3-tier financial banking application to Zero Trust. Include network diagrams, mTLS deployment plan, and identity provider integration (OIDC/SAML).',
                    maxScore: 100,
                    rubric: [
                      { criterion: 'Threat Modeling & Attack Surface Identification', maxScore: 30 },
                      { criterion: 'Zero Trust Control Plane & PDP/PEP Integration', maxScore: 35 },
                      { criterion: 'mTLS & Certificate Lifecycle Automation Plan', maxScore: 20 },
                      { criterion: 'Regulatory Compliance (NIST / ISO 27001)', maxScore: 15 }
                    ]
                  }
                }
              }
            ]
          }
        ]
      },
      {
        version: '1.3',
        status: 'under_review',
        createdAt: '2026-10-10T12:00:00Z',
        updatedAt: '2026-10-12T16:00:00Z',
        changelog: 'Revamped Module 2 with AI-driven threat intelligence analysis and updated WireGuard ZTNA tunnels.',
        reviewFeedback: [
          {
            id: 'com_1',
            authorId: 'usr_reviewer',
            authorName: 'Prof. David Chen',
            authorRole: 'Reviewer',
            createdAt: '2026-10-13T10:15:00Z',
            category: 'curriculum',
            comment: 'The updated WireGuard section is exceptional. Please ensure the assignment rubric clarifies expectations around cloud HSM key storage.',
            resolved: false
          }
        ],
        modules: [
          {
            id: 'mod_1',
            title: 'Foundations of Zero Trust & Identity Verification (v1.3)',
            description: 'Deconstruct the castle-and-moat perimeter paradigm.',
            order: 1,
            lessons: [
              {
                id: 'les_1_1',
                title: 'The Death of the Traditional Perimeter',
                durationMinutes: 18,
                type: 'video',
                order: 1,
                content: {
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                  videoDuration: '18:24',
                  textBody: 'Updated lecture video with 2026 threat telemetry.'
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'crs_cloud_02',
    slug: 'cloud-native-kubernetes-production',
    title: 'Cloud-Native Distributed Systems on Kubernetes',
    subtitle: 'Production GitOps, Istio service mesh, stateful workloads, observability, and high-availability clusters.',
    description: 'Go beyond "hello world" container orchestration. This course equips software engineers and DevOps professionals to manage mission-critical Kubernetes clusters at scale with ArgoCD, Prometheus, OpenTelemetry, and automated canary rollouts.',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    category: 'Cloud Engineering',
    level: 'Intermediate',
    language: 'English',
    estimatedHours: 32,
    price: 149,
    isFree: false,
    tags: ['Kubernetes', 'Docker', 'GitOps', 'ArgoCD', 'Istio', 'Observability'],
    learningObjectives: [
      'Design fault-tolerant Kubernetes topologies with pod disruption budgets',
      'Deploy automated declarative pipelines using GitOps and ArgoCD',
      'Implement traffic shifting, circuit breakers, and fault injection with Istio',
      'Instrument distributed tracing across microservices with OpenTelemetry'
    ],
    prerequisites: [
      'Comfortable with Docker containers and Linux networking',
      'Basic understanding of YAML and CLI workflows'
    ],
    instructorId: 'usr_instructor_1',
    instructorName: 'Elena Rostova, CISSP',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    instructorBio: 'Principal Cybersecurity Architect & Cloud Specialist.',
    activeVersion: '2.0',
    enrollmentCount: 2150,
    rating: 4.8,
    reviewCount: 489,
    versions: [
      {
        version: '2.0',
        status: 'published',
        createdAt: '2026-08-15T00:00:00Z',
        updatedAt: '2026-09-20T10:00:00Z',
        publishedAt: '2026-09-21T08:00:00Z',
        changelog: 'Full overhaul for Kubernetes 1.32 & Gateway API specs.',
        modules: [
          {
            id: 'mod_c1',
            title: 'Cluster Architecture & Control Plane Internals',
            description: 'Understand etcd quorum, kube-apiserver reconciliation, and controller loops.',
            order: 1,
            lessons: [
              {
                id: 'les_c1_1',
                title: 'Declarative Reconciliation & etcd Consistency',
                durationMinutes: 22,
                type: 'text',
                order: 1,
                content: {
                  textBody: `### How Kubernetes Actually Works: The Reconciler\n\nKubernetes does not execute imperative commands. When you execute \`kubectl apply\`, you store the *Desired State* into **etcd**.\n\nThe controller manager continuously runs the **reconciliation loop**:\n\n1. Observe current state of the world\n2. Compare with desired state in etcd\n3. Issue corrective actions to eliminate the diff\n\n\`\`\`bash\n# Inspect cluster events in real time\nkubectl get events -A --sort-by='.metadata.creationTimestamp' -w\n\`\`\``
                }
              },
              {
                id: 'les_c1_2',
                title: 'Knowledge Check: Kubernetes Controller Patterns',
                durationMinutes: 15,
                type: 'quiz',
                order: 2,
                content: {
                  quiz: {
                    id: 'qz_k8s_01',
                    title: 'Kubernetes Internal Architecture Quiz',
                    description: 'Verify your understanding of controllers and distributed consensus.',
                    timeLimitMinutes: 10,
                    passThresholdPercent: 70,
                    maxAttempts: 3,
                    questions: [
                      {
                        id: 'qk1',
                        prompt: 'What algorithm does etcd use to achieve distributed leader election and consensus?',
                        options: ['Paxos', 'Raft', 'Proof of Stake', 'Two-Phase Commit'],
                        correctOptionIndex: 1,
                        explanation: 'etcd utilizes the Raft consensus algorithm for distributed state and quorum.',
                        points: 10
                      }
                    ]
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'crs_gov_03',
    slug: 'data-governance-compliance-gdpr-ai',
    title: 'Data Governance, Compliance & AI Regulation (EU AI Act & ISO 42001)',
    subtitle: 'Establish rigorous data provenance, audit logging, model cards, and global regulatory compliance.',
    description: 'Essential training for enterprise leaders, privacy engineers, and compliance officers. Master the practical implementation of ISO/IEC 42001 (Artificial Intelligence Management Systems), GDPR compliance, and algorithmic accountability.',
    thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    category: 'Governance & Compliance',
    level: 'Executive',
    language: 'English',
    estimatedHours: 16,
    price: 0,
    isFree: true,
    tags: ['Data Governance', 'ISO 42001', 'EU AI Act', 'GDPR', 'Compliance', 'Auditability'],
    learningObjectives: [
      'Implement data lineage and automated audit trails',
      'Comply with high-risk AI obligations under the EU AI Act',
      'Establish incident reporting and algorithmic risk mitigation workflows',
      'Formulate organizational governance policies with measurable KPIs'
    ],
    prerequisites: [
      'Basic familiarity with enterprise IT operations and privacy principles'
    ],
    instructorId: 'usr_reviewer',
    instructorName: 'Prof. David Chen',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    instructorBio: 'Academic Chair of Technology Law and Digital Governance.',
    activeVersion: '1.0',
    enrollmentCount: 3890,
    rating: 4.95,
    reviewCount: 620,
    versions: [
      {
        version: '1.0',
        status: 'published',
        createdAt: '2026-07-01T00:00:00Z',
        updatedAt: '2026-08-01T12:00:00Z',
        publishedAt: '2026-08-05T09:00:00Z',
        changelog: 'Initial curriculum release.',
        modules: [
          {
            id: 'mod_g1',
            title: 'Global Compliance Landscapes & Regulatory Frameworks',
            description: 'Comparative analysis of GDPR, CCPA, and the European Union AI Act.',
            order: 1,
            lessons: [
              {
                id: 'les_g1_1',
                title: 'Data Subject Rights & The Right to Explanation',
                durationMinutes: 20,
                type: 'text',
                order: 1,
                content: {
                  textBody: `### Data Subject Rights in Algorithmic Decision-Making\n\nArticle 22 of the GDPR establishes a general prohibition on solely automated decision-making producing legal effects or significantly affecting an individual without human intervention.\n\n#### Key Organizational Requirements:\n1. Transparent technical documentation\n2. Continuous bias monitoring and post-market surveillance\n3. Verifiable audit logging of all training and deployment checkpoints.`
                }
              }
            ]
          }
        ]
      }
    ]
  }
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr_alex_01',
    learnerId: 'usr_learner_1',
    courseId: 'crs_sec_01',
    courseVersion: '1.2',
    enrolledAt: '2026-10-05T14:00:00Z',
    lastAccessedAt: '2026-10-15T04:45:00Z',
    completedLessonIds: ['les_1_1', 'les_1_2', 'les_1_3'],
    progressPercent: 60,
    isCompleted: false,
  },
  {
    id: 'enr_alex_02',
    learnerId: 'usr_learner_1',
    courseId: 'crs_gov_03',
    courseVersion: '1.0',
    enrolledAt: '2026-09-15T10:00:00Z',
    lastAccessedAt: '2026-10-02T12:00:00Z',
    completedLessonIds: ['les_g1_1'],
    progressPercent: 100,
    isCompleted: true,
    completedAt: '2026-10-02T12:00:00Z',
    certificateId: 'cert_alex_gov_01'
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert_alex_gov_01',
    certificateNumber: 'LS-2026-GOV-89410',
    learnerId: 'usr_learner_1',
    learnerName: 'Alexandria Miller',
    courseId: 'crs_gov_03',
    courseTitle: 'Data Governance, Compliance & AI Regulation (EU AI Act & ISO 42001)',
    courseVersion: '1.0',
    issuedAt: '2026-10-02T12:00:00Z',
    verificationHash: '9f83a218d6e3c0429188faeb2c091f37e41b9d4c',
    issuerName: 'LearnSphere Global Academic Board',
    issuerTitle: 'Board of Governors & Compliance Secretariat',
    status: 'valid',
  }
];

export const INITIAL_ASSIGNMENT_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub_alex_01',
    assignmentId: 'asg_sec_01',
    courseId: 'crs_sec_01',
    lessonId: 'les_2_2',
    learnerId: 'usr_learner_1',
    learnerName: 'Alexandria Miller',
    learnerEmail: 'alex.miller@gmail.com',
    submittedAt: '2026-10-14T18:30:00Z',
    fileUrl: 'https://example.com/files/zero-trust-migration-arch-report-alex.pdf',
    fileName: 'zero-trust-migration-arch-report-alex.pdf',
    notes: 'Includes complete Calico CNI configuration, SPIFFE/SPIRE federation design, and NIST compliance gap matrix.',
    status: 'pending',
    maxScore: 100,
  }
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att_01',
    quizId: 'qz_sec_01',
    courseId: 'crs_sec_01',
    learnerId: 'usr_learner_1',
    learnerName: 'Alexandria Miller',
    attemptNumber: 1,
    startedAt: '2026-10-14T10:00:00Z',
    submittedAt: '2026-10-14T10:12:00Z',
    answers: {
      q1: 0,
      q2: 1,
      q3: 1,
    },
    score: 30,
    maxScore: 30,
    percentage: 100,
    passed: true,
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_101',
    timestamp: '2026-10-15T05:00:12Z',
    actorId: 'usr_super_admin',
    actorName: 'Dr. Sarah Al-Mansoor',
    actorRole: 'super_admin',
    action: 'POLICY_EVALUATION',
    entityType: 'role',
    entityId: 'role_admin',
    details: 'Verified least-privilege matrix across all course authoring teams.',
    ipAddress: '192.168.1.1',
    severity: 'info',
  },
  {
    id: 'aud_102',
    timestamp: '2026-10-14T19:42:00Z',
    actorId: 'usr_admin',
    actorName: 'Elena Rostova, CISSP',
    actorRole: 'admin',
    action: 'COURSE_REVIEW_COMMENT_POSTED',
    entityType: 'course',
    entityId: 'crs_sec_01',
    details: 'Posted academic QA comment on version 1.3 regarding WireGuard ZTNA tunnels.',
    ipAddress: '10.0.4.15',
    severity: 'info',
  },
  {
    id: 'aud_103',
    timestamp: '2026-10-13T14:10:00Z',
    actorId: 'usr_admin',
    actorName: 'Elena Rostova, CISSP',
    actorRole: 'admin',
    action: 'COURSE_VERSION_SUBMITTED',
    entityType: 'course',
    entityId: 'crs_sec_01',
    details: 'Submitted version 1.3 for academic review and accreditation approval.',
    ipAddress: '172.16.8.99',
    severity: 'info',
  },
  {
    id: 'aud_104',
    timestamp: '2026-10-02T12:00:00Z',
    actorId: 'usr_super_admin',
    actorName: 'Dr. Sarah Al-Mansoor',
    actorRole: 'super_admin',
    action: 'CERTIFICATE_ISSUED',
    entityType: 'certificate',
    entityId: 'cert_alex_gov_01',
    details: 'Issued verifiable credential LS-2026-GOV-89410 to Alexandria Miller with cryptographic hash 9f83a218d...',
    ipAddress: '127.0.0.1',
    severity: 'info',
  }
];

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org_safaricom_enterprise',
    name: 'East Africa Telecom Consortium',
    domain: 'telcom-kenya.co.ke',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
    seatLimit: 500,
    activeSeats: 342,
    assignedCourseIds: ['crs_sec_01', 'crs_cloud_02', 'crs_gov_03'],
    cohorts: [
      {
        id: 'coh_2026_q4_cyber',
        name: 'Q4 2026 Cybersecurity Specialization Cohort',
        organizationId: 'org_safaricom_enterprise',
        courseIds: ['crs_sec_01'],
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        memberEmails: ['alex.miller@gmail.com', 'w.mwangi@telcom-kenya.co.ke', 'f.otieno@telcom-kenya.co.ke']
      },
      {
        id: 'coh_2026_devops',
        name: 'Infrastructure & Kubernetes Engineering Cohort',
        organizationId: 'org_safaricom_enterprise',
        courseIds: ['crs_cloud_02'],
        startDate: '2026-09-01',
        endDate: '2026-11-30',
        memberEmails: ['j.kamau@telcom-kenya.co.ke', 'a.nyambura@telcom-kenya.co.ke']
      }
    ]
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_8041',
    userId: 'usr_learner_1',
    userName: 'Alexandria Miller',
    userEmail: 'alex.miller@gmail.com',
    subject: 'Request assistance with Kubernetes NetworkPolicy lab verification',
    category: 'academic',
    priority: 'medium',
    status: 'open',
    createdAt: '2026-10-14T22:15:00Z',
    updatedAt: '2026-10-15T03:00:00Z',
    messages: [
      {
        id: 'msg_1',
        senderId: 'usr_learner_1',
        senderName: 'Alexandria Miller',
        senderRole: 'Learner',
        text: 'Hello, in lesson 2.1 Calico Network Policies, my pod ingress logs are rejecting port 443 despite the selector matching app=frontend. Could the instructor clarify the egress rule requirements?',
        timestamp: '2026-10-14T22:15:00Z'
      },
      {
        id: 'msg_2',
        senderId: 'usr_support',
        senderName: 'Marcus Vance',
        senderRole: 'Support Agent',
        text: 'Thank you for reaching out Alexandria! I have verified your active enrollment in Network Security Fundamentals. I have escalated this ticket to the course author Elena Rostova for academic guidance.',
        timestamp: '2026-10-15T03:00:00Z'
      }
    ]
  }
];

export const INITIAL_LEARNING_PATHS: LearningPath[] = [
  {
    id: 'lp_cyber_architect',
    title: 'Enterprise Cyber Defense & Zero Trust Architect',
    slug: 'enterprise-cyber-defense-architect',
    description: 'A comprehensive curriculum designed to take security engineers from baseline network analysis to elite Zero Trust architecture and executive compliance leadership.',
    iconName: 'ShieldAlert',
    estimatedWeeks: 12,
    careerRole: 'Chief Information Security Officer (CISO) / Principal Security Architect',
    courseIds: ['crs_sec_01', 'crs_gov_03']
  },
  {
    id: 'lp_cloud_platform',
    title: 'Cloud-Native Platform & Site Reliability Engineer',
    slug: 'cloud-native-platform-sre',
    description: 'Master large-scale distributed systems, GitOps automation, service mesh observability, and zero-downtime production deployment topologies.',
    iconName: 'Server',
    estimatedWeeks: 16,
    careerRole: 'Principal Platform Engineer / Lead SRE',
    courseIds: ['crs_cloud_02', 'crs_sec_01']
  }
];
