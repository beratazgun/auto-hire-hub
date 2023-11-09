declare global {
  declare module 'express-session' {
    interface SessionData {
      user: {
        id: string;
        renterCode?: string;
        carOwnerCode?: string;
        fullName: string;
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
        password: string;
        isAccountActive: boolean;
        isAccountApproved: boolean;
        isAccountBlocked: boolean;
        isAccountDeleted: boolean;
        is2FAEnabled: boolean;
        accountApprovedAt: Date;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
      };
      csrfToken: string;
    }
  }
}
