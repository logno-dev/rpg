import { createSignal, Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { getUser } from "~/lib/auth";

export default function Home() {
  const [isRegister, setIsRegister] = createSignal(false);
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const navigate = useNavigate();
  
  // Redirect to character select if already logged in
  onMount(async () => {
    const user = await getUser();
    if (user) {
      navigate('/character-select');
    }
  });

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.target as HTMLFormElement;
    
    // Read values directly from input elements (FormData doesn't work with SolidJS SSR)
    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
    
    const email = emailInput?.value || '';
    const password = passwordInput?.value || '';

    console.log('Email:', email);
    console.log('Password length:', password?.length);

    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      const payload = { email, password };
      console.log('Sending payload to server...');

      const response = await fetch(isRegister() ? '/api/register' : '/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
      } else {
        // Success - navigate to character select
        navigate('/character-select');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="container">
      <div style={{ "max-width": "400px", margin: "4rem auto" }}>
        <h1 class="title" style={{ "text-align": "center", "margin-bottom": "2rem" }}>
          Morthvale
        </h1>

        <div class="card">
          <h2 style={{ "margin-bottom": "1.5rem" }}>
            {isRegister() ? "Create Account" : "Login"}
          </h2>

          <Show when={error()}>
            <div class="error">{error()}</div>
          </Show>

          <form onSubmit={handleSubmit}>
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                disabled={loading()}
              />
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                minLength={6}
                disabled={loading()}
              />
            </div>

            <button type="submit" class="button" style={{ width: "100%" }} disabled={loading()}>
              {loading() ? "Loading..." : isRegister() ? "Register" : "Login"}
            </button>
          </form>

          <p style={{ "text-align": "center", "margin-top": "1rem" }}>
            <button
              class="button secondary"
              onClick={() => setIsRegister(!isRegister())}
              style={{ width: "100%" }}
              disabled={loading()}
              type="button"
            >
              {isRegister()
                ? "Already have an account? Login"
                : "Need an account? Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
