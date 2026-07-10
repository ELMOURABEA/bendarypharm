import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

const isRealConfigured = 
  supabaseUrl && 
  supabaseUrl !== "https://your-project.supabase.co" && 
  !supabaseUrl.includes("your-project") &&
  supabaseKey && 
  supabaseKey !== "your-anon-key" &&
  !supabaseKey.includes("your-anon");

// Real client creation
const realSupabase = createClient(supabaseUrl, supabaseKey);

// High-fidelity local emulation for robust sandbox experience
class MockAuth {
  private listeners: Array<(event: string, session: any) => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === "elb_session") {
          this.trigger();
        }
      });
    }
  }

  private trigger() {
    const session = this.getLocalStorageSession();
    this.listeners.forEach((cb) => cb(session ? "SIGNED_IN" : "SIGNED_OUT", session));
  }

  private getLocalStorageSession() {
    try {
      const sessionStr = localStorage.getItem("elb_session");
      if (sessionStr) {
        return JSON.parse(sessionStr);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  async getSession() {
    return { data: { session: this.getLocalStorageSession() }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    const session = this.getLocalStorageSession();
    
    setTimeout(() => {
      callback(session ? "SIGNED_IN" : "SIGNED_OUT", session);
    }, 10);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((cb) => cb !== callback);
          },
        },
      },
    };
  }

  async signUp({ email, password, options }: any) {
    try {
      const usersStr = localStorage.getItem("elb_users") || "[]";
      const users = JSON.parse(usersStr);

      if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        return { data: null, error: { message: "البريد الإلكتروني مسجل مسجل بالفعل لدينا!" } };
      }

      const newUser = {
        id: "U-" + Math.random().toString(36).substr(2, 9),
        email,
        password,
        user_metadata: {
          full_name: options?.data?.full_name || email.split("@")[0],
        },
        phone: "",
        addresses: [],
      };

      users.push(newUser);
      localStorage.setItem("elb_users", JSON.stringify(users));

      const session = {
        user: newUser,
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24,
      };

      localStorage.setItem("elb_session", JSON.stringify(session));
      this.trigger();

      return { data: { user: newUser, session }, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message } };
    }
  }

  async signInWithPassword({ email, password }: any) {
    try {
      const usersStr = localStorage.getItem("elb_users") || "[]";
      const users = JSON.parse(usersStr);

      let user = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      // Support a default dummy admin login for easier demoing if users list is empty
      if (!user && email.toLowerCase() === "m.elmourabea@gmail.com" && password === "123456") {
        const defaultUser = {
          id: "U-default-admin",
          email,
          user_metadata: { full_name: "محمد المرابع" },
          phone: "01200400094",
          addresses: [
            { id: "A-1", label: "المنزل", details: "شارع الجلاء، طنطا، الغربية" },
            { id: "A-2", label: "العمل", details: "صيدلية البنداري الفرع الرئيسي، المحلة الكبرى" },
          ],
        };
        const session = {
          user: defaultUser,
          expires_at: Math.floor(Date.now() / 1000) + 3600 * 24,
        };
        localStorage.setItem("elb_session", JSON.stringify(session));
        this.trigger();
        return { data: { user: defaultUser, session }, error: null };
      }

      if (!user) {
        return { data: null, error: { message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" } };
      }

      const session = {
        user,
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24,
      };

      localStorage.setItem("elb_session", JSON.stringify(session));
      this.trigger();

      return { data: { user, session }, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message } };
    }
  }

  async signOut() {
    localStorage.removeItem("elb_session");
    this.trigger();
    return { error: null };
  }

  async signInWithOAuth({ provider }: any) {
    const dummyUser = {
      id: "U-google-" + Math.random().toString(36).substr(2, 5),
      email: "google.user@gmail.com",
      user_metadata: {
        full_name: "مستخدم جوجل",
      },
      phone: "",
      addresses: [],
    };
    const session = {
      user: dummyUser,
      expires_at: Math.floor(Date.now() / 1000) + 3600 * 24,
    };
    localStorage.setItem("elb_session", JSON.stringify(session));
    this.trigger();
    return { error: null };
  }

  async updateUser(data: any) {
    try {
      const session = this.getLocalStorageSession();
      if (!session) return { error: { message: "لا يوجد جلسة نشطة" } };

      const usersStr = localStorage.getItem("elb_users") || "[]";
      const users = JSON.parse(usersStr);

      const userIdx = users.findIndex((u: any) => u.id === session.user.id);
      
      const updatedUser = {
        ...session.user,
        ...data,
        user_metadata: {
          ...session.user?.user_metadata,
          ...data?.user_metadata,
        }
      };

      if (userIdx !== -1) {
        users[userIdx] = { ...users[userIdx], ...updatedUser };
        localStorage.setItem("elb_users", JSON.stringify(users));
      }

      session.user = updatedUser;
      localStorage.setItem("elb_session", JSON.stringify(session));
      this.trigger();

      return { data: { user: updatedUser }, error: null };
    } catch (err: any) {
      return { error: { message: err.message } };
    }
  }
}

class MockFrom {
  tableName: string;
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  select() {
    return {
      eq: () => Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
      then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb),
    };
  }
}

const mockSupabase = {
  auth: new MockAuth(),
  from: (tableName: string) => new MockFrom(tableName),
};

export const supabase = isRealConfigured ? realSupabase : (mockSupabase as any);
