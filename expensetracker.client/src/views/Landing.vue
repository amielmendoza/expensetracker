<template>
  <div class="landing">
    <!-- Nav -->
    <nav class="landing-nav">
      <div class="nav-inner">
        <router-link to="/" class="nav-logo">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span>ExpenseTracker</span>
        </router-link>
        <div class="nav-actions">
          <router-link to="/login" class="nav-signin">Sign In</router-link>
          <router-link to="/login?mode=signup" class="nav-cta">Get Started</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-text">
          <div class="hero-badge">Free to use</div>
          <h1>Take control of your <span class="gradient-text">finances</span></h1>
          <p class="hero-subtitle">
            Track expenses, manage multiple accounts, set savings goals, and gain insights into your spending habits — all in one beautifully simple app.
          </p>
          <div class="hero-actions">
            <router-link to="/login?mode=signup" class="btn-hero-primary">
              Start Tracking Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </router-link>
          </div>
          <p class="hero-note">No credit card required</p>
        </div>
        <div class="hero-visual">
          <div class="mock-dashboard">
            <div class="mock-header">
              <div class="mock-dots">
                <span></span><span></span><span></span>
              </div>
              <span class="mock-title">Dashboard</span>
            </div>
            <div class="mock-stats">
              <div class="mock-stat">
                <span class="mock-stat-label">This Month</span>
                <span class="mock-stat-value expense">-&#8369;24,580</span>
              </div>
              <div class="mock-stat">
                <span class="mock-stat-label">Income</span>
                <span class="mock-stat-value income">+&#8369;45,000</span>
              </div>
              <div class="mock-stat">
                <span class="mock-stat-label">Savings</span>
                <span class="mock-stat-value savings">&#8369;20,420</span>
              </div>
            </div>
            <div class="mock-chart">
              <div class="mock-bar" style="height: 45%"></div>
              <div class="mock-bar" style="height: 70%"></div>
              <div class="mock-bar" style="height: 55%"></div>
              <div class="mock-bar" style="height: 85%"></div>
              <div class="mock-bar" style="height: 40%"></div>
              <div class="mock-bar" style="height: 65%"></div>
              <div class="mock-bar active" style="height: 50%"></div>
            </div>
            <div class="mock-transactions">
              <div class="mock-tx">
                <span class="mock-tx-icon" style="background:#fef3c7">🍔</span>
                <span class="mock-tx-name">Food & Dining</span>
                <span class="mock-tx-amount">-&#8369;1,250</span>
              </div>
              <div class="mock-tx">
                <span class="mock-tx-icon" style="background:#dbeafe">🏠</span>
                <span class="mock-tx-name">Rent</span>
                <span class="mock-tx-amount">-&#8369;12,000</span>
              </div>
              <div class="mock-tx">
                <span class="mock-tx-icon" style="background:#d1fae5">💰</span>
                <span class="mock-tx-name">Salary</span>
                <span class="mock-tx-amount income">+&#8369;45,000</span>
              </div>
            </div>
          </div>
          <div class="float-card float-card-1">
            <span class="float-icon">📊</span>
            <span>Monthly Report Ready</span>
          </div>
          <div class="float-card float-card-2">
            <span class="float-icon">🎯</span>
            <span>Goal 78% complete!</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features" id="features">
      <div class="section-inner">
        <div class="section-header">
          <h2>Everything you need to manage your money</h2>
          <p>Powerful features wrapped in a simple, intuitive interface</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon" style="background: linear-gradient(135deg, #f97316, #ea580c)">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h3>Expense & Income Tracking</h3>
            <p>Log every peso in and out. Categorize transactions, add notes, and see where your money goes each month.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background: linear-gradient(135deg, #6366f1, #4f46e5)">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
            <h3>Multiple Accounts</h3>
            <p>Manage bank accounts, e-wallets like GCash, and credit cards all in one place with automatic balance tracking.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background: linear-gradient(135deg, #10b981, #059669)">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </div>
            <h3>Reports & Analytics</h3>
            <p>Visual charts showing income vs expenses over time. Spot trends, compare months, and make smarter financial decisions.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3>Savings Goals</h3>
            <p>Set financial targets with deadlines. Track your progress visually and stay motivated to reach your savings milestones.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="how-it-works">
      <div class="section-inner">
        <div class="section-header">
          <h2>Get started in 3 simple steps</h2>
          <p>From sign-up to financial clarity in minutes</p>
        </div>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Create your account</h3>
            <p>Sign up free with just your email. No credit card, no strings attached.</p>
          </div>
          <div class="step-connector"></div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Add your accounts</h3>
            <p>Set up your bank accounts, e-wallets, and credit cards to start tracking balances.</p>
          </div>
          <div class="step-connector"></div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Track & grow</h3>
            <p>Log transactions, set goals, and watch your financial health improve over time.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Guide -->
    <section class="guide">
      <div class="section-inner">
        <div class="section-header">
          <h2>How to use ExpenseTracker</h2>
          <p>A quick walkthrough of everything you can do</p>
        </div>
        <div class="guide-steps">
          <div class="guide-step">
            <div class="guide-step-number">1</div>
            <div class="guide-step-content">
              <div class="guide-step-icon">💸</div>
              <h3>Track Your Expenses</h3>
              <p>Tap "+ Add Expense" to log any spending. Enter the amount, pick a category, choose which account it came from, and add optional notes. For bills that repeat every month like rent or subscriptions, check "Monthly Recurring" to keep them organized separately.</p>
              <div class="guide-tip">Tip: Use the tabs to quickly switch between recurring and one-time expenses</div>
            </div>
          </div>
          <div class="guide-step">
            <div class="guide-step-number">2</div>
            <div class="guide-step-content">
              <div class="guide-step-icon">💰</div>
              <h3>Log Your Income</h3>
              <p>Head to the Income page to record all money coming in — salary, freelance work, side hustles, refunds, or gifts. Each entry gets a category and account, so you always know where your money is coming from and where it lands.</p>
              <div class="guide-tip">Tip: Use the month selector to view income history for any past month</div>
            </div>
          </div>
          <div class="guide-step">
            <div class="guide-step-number">3</div>
            <div class="guide-step-content">
              <div class="guide-step-icon">🏦</div>
              <h3>Manage Your Accounts</h3>
              <p>Add all your financial accounts — bank accounts (BPI, MetroBank), e-wallets (GCash), and credit cards. Each account tracks its own balance that updates automatically when you add expenses or income. You can also transfer money between accounts.</p>
              <div class="guide-tip">Tip: Credit card balances work in reverse — expenses increase the balance (debt), payments decrease it</div>
            </div>
          </div>
          <div class="guide-step">
            <div class="guide-step-number">4</div>
            <div class="guide-step-content">
              <div class="guide-step-icon">📊</div>
              <h3>View Reports & Analytics</h3>
              <p>The Reports page shows your income vs. expenses as a bar chart over time. Toggle between 3-month, 6-month, or 12-month views to spot spending trends. A category breakdown chart shows exactly where your money goes each month.</p>
              <div class="guide-tip">Tip: Compare months side by side to see if your spending is going up or down</div>
            </div>
          </div>
          <div class="guide-step">
            <div class="guide-step-number">5</div>
            <div class="guide-step-content">
              <div class="guide-step-icon">🎯</div>
              <h3>Set Savings Goals</h3>
              <p>Want to save for something? Create a savings goal with a target amount and deadline. Track your progress with a visual progress bar. Update your saved amount anytime to watch it grow toward your target.</p>
              <div class="guide-tip">Tip: Set realistic deadlines and break big goals into smaller milestones</div>
            </div>
          </div>
          <div class="guide-step">
            <div class="guide-step-number">6</div>
            <div class="guide-step-content">
              <div class="guide-step-icon">🏷️</div>
              <h3>Organize with Categories</h3>
              <p>The app comes with default categories, but you can create your own. Head to Categories, tap "+ Add", pick an emoji icon from the visual picker, choose a color, and you're set. Categories help you see exactly where your money goes in reports.</p>
              <div class="guide-tip">Tip: Create specific categories like "Coffee" or "Grab" for spending you want to track closely</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="cta-inner">
        <div class="cta-glow"></div>
        <h2>Ready to take control of your money?</h2>
        <p>Join thousands of users who are already tracking smarter, saving more, and stressing less about finances.</p>
        <router-link to="/login?mode=signup" class="btn-cta">
          Get Started for Free
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="logo-icon small">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span>ExpenseTracker</span>
        </div>
        <p class="footer-copy">&copy; {{ new Date().getFullYear() }} ExpenseTracker. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.landing {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow-x: hidden;
}

/* ── Nav ── */
.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(248, 250, 252, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

[data-theme="dark"] .landing-nav {
  background: rgba(13, 17, 23, 0.85);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.875rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--text-primary);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #f5b731 0%, #e5a520 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(245, 183, 49, 0.3);
}

.logo-icon.small {
  width: 28px;
  height: 28px;
  border-radius: 8px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-signin {
  padding: 0.5rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-signin:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.nav-cta {
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.nav-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

/* ── Hero ── */
.hero {
  position: relative;
  padding: 8rem 2rem 4rem;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 70%),
    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 60%);
}

[data-theme="dark"] .hero-bg {
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99, 102, 241, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(139, 92, 246, 0.12) 0%, transparent 60%);
}

.hero-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-text h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #f5b731 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  max-width: 520px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
}

.btn-hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
}

.hero-note {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 1rem 0 0 0;
}

/* ── Dashboard Mockup ── */
.hero-visual {
  position: relative;
  animation: fadeInUp 0.8s ease 0.2s both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.mock-dashboard {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: var(--shadow-xl);
}

.mock-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.mock-dots {
  display: flex;
  gap: 0.375rem;
}

.mock-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.mock-dots span:nth-child(1) { background: #ef4444; }
.mock-dots span:nth-child(2) { background: #f59e0b; }
.mock-dots span:nth-child(3) { background: #10b981; }

.mock-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.mock-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.mock-stat {
  background: var(--bg-primary);
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mock-stat-label {
  font-size: 0.65rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.mock-stat-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.mock-stat-value.expense { color: #ef4444; }
.mock-stat-value.income { color: #10b981; }
.mock-stat-value.savings { color: #6366f1; }

.mock-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 80px;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.mock-bar {
  flex: 1;
  background: linear-gradient(to top, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.6));
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
}

.mock-bar.active {
  background: linear-gradient(to top, #6366f1, #818cf8);
}

.mock-transactions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mock-tx {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: 8px;
}

.mock-tx-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.mock-tx-name {
  flex: 1;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.mock-tx-amount {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ef4444;
}

.mock-tx-amount.income {
  color: #10b981;
}

/* Floating cards */
.float-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  box-shadow: var(--shadow-lg);
  white-space: nowrap;
}

.float-icon {
  font-size: 1.1rem;
}

.float-card-1 {
  top: -10px;
  right: -20px;
  animation: floatA 4s ease-in-out infinite;
}

.float-card-2 {
  bottom: 30px;
  left: -30px;
  animation: floatB 5s ease-in-out infinite;
}

@keyframes floatA {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes floatB {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

/* ── Features ── */
.features {
  padding: 6rem 2rem;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-header h2 {
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.section-header p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.feature-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
}

.feature-card p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

/* ── How it Works ── */
.how-it-works {
  padding: 6rem 2rem;
  background: var(--bg-secondary);
}

.steps {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
}

.step {
  text-align: center;
  flex: 1;
  max-width: 280px;
  padding: 0 1.5rem;
}

.step-number {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  font-size: 1.25rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.step h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
}

.step p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.step-connector {
  width: 60px;
  height: 2px;
  background: var(--border);
  margin-top: 28px;
  flex-shrink: 0;
}

/* ── Guide ── */
.guide {
  padding: 6rem 2rem;
}

.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.guide-step {
  display: flex;
  gap: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.guide-step:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.guide-step-number {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  font-size: 1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.guide-step-content {
  flex: 1;
}

.guide-step-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.guide-step-content h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
}

.guide-step-content p {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
}

.guide-tip {
  font-size: 0.8rem;
  color: var(--primary);
  background: rgba(99, 102, 241, 0.08);
  border-left: 3px solid var(--primary);
  padding: 0.5rem 0.75rem;
  border-radius: 0 8px 8px 0;
  font-weight: 500;
}

/* ── CTA ── */
.cta {
  padding: 6rem 2rem;
  position: relative;
}

.cta-inner {
  position: relative;
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%);
  border-radius: 24px;
  padding: 4rem 3rem;
  overflow: hidden;
}

.cta-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.cta-inner h2 {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1rem 0;
  position: relative;
}

.cta-inner p {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 2rem 0;
  line-height: 1.6;
  position: relative;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2.5rem;
  background: white;
  color: #4f46e5;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* ── Footer ── */
.landing-footer {
  padding: 2rem;
  border-top: 1px solid var(--border);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.footer-copy {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }

  .hero-text h1 {
    font-size: 2.75rem;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-visual {
    max-width: 480px;
    margin: 0 auto;
  }

  .float-card-1 { right: -10px; }
  .float-card-2 { left: -10px; }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 6rem 1.25rem 3rem;
  }

  .hero-text h1 {
    font-size: 2.25rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .features,
  .how-it-works,
  .guide,
  .cta {
    padding: 4rem 1.25rem;
  }

  .guide-step {
    padding: 1.5rem;
    gap: 1rem;
  }

  .section-header h2 {
    font-size: 1.75rem;
  }

  .steps {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .step-connector {
    width: 2px;
    height: 30px;
    margin: 0;
  }

  .cta-inner {
    padding: 3rem 1.5rem;
  }

  .cta-inner h2 {
    font-size: 1.5rem;
  }

  .footer-inner {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .nav-inner {
    padding: 0.75rem 1rem;
  }

  .nav-signin {
    display: none;
  }

  .hero-text h1 {
    font-size: 1.875rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .float-card {
    display: none;
  }

  .mock-stats {
    grid-template-columns: 1fr;
  }
}
</style>
