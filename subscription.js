/* Teacher subscription payment request flow. Payment is verified manually by the administrator. */
(() => {
  const SUPABASE_URL = 'https://dtgspwsxwslntlayqcbe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_squK4xnTjeRDy-I88MuWeQ_V3YUd3cf';
  const QR_IMAGE_URL = 'https://raw.githubusercontent.com/Timson1505/elge_marketplace/main/payment-qr.jpeg';
  const plans = {
    beginner: { title: 'Beginner', price: '$10', levels: 'Beginner 1, 2 & 3' },
    elementary: { title: 'Elementary', price: '$15', levels: 'Elementary 1, 2 & 3' },
    all_lessons: { title: 'All lessons', price: '$20', levels: 'All available lesson levels' }
  };

  function init() {
    // Build the payment modal even if Supabase's CDN is unavailable; the QR must still open.
    const client = window.supabase?.createClient
      ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        })
      : null;
    const style = document.createElement('style');
    style.textContent = `
      .subscription-modal[hidden]{display:none!important}
      .subscription-modal{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(14,20,38,.72);backdrop-filter:blur(5px)}
      .subscription-dialog{position:relative;width:min(100%,490px);max-height:92vh;overflow:auto;border-radius:22px;background:#fff;padding:26px;color:#202840;box-shadow:0 24px 80px rgba(0,0,0,.3);font-family:Arial,sans-serif}
      .subscription-close{position:absolute;right:16px;top:12px;border:0;background:#f1f3f8;border-radius:50%;width:38px;height:38px;font-size:24px;cursor:pointer}
      .subscription-eyebrow{font-size:11px;font-weight:800;letter-spacing:1.6px;color:#5968d8}
      .subscription-dialog h2{font-size:26px;margin:8px 42px 6px 0;color:#202840}
      .subscription-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#f5f6ff;border:1px solid #e1e5ff;padding:14px 16px;border-radius:14px;margin:16px 0}
      .subscription-summary strong{font-size:25px;color:#4d58cb}.subscription-summary span{font-size:13px;color:#626b80}
      .subscription-qr-wrap{display:grid;justify-items:center;gap:8px;padding:12px;border:1px dashed #d4d9e7;border-radius:16px}
      .subscription-qr{display:block;width:min(100%,250px);height:auto;max-height:250px;object-fit:contain;border-radius:8px}
      .subscription-note{font-size:13px;line-height:1.55;color:#5d667a}
      .subscription-confirm{display:block;width:100%;border:0;border-radius:12px;padding:14px 16px;margin-top:16px;background:#4e5bd5;color:#fff;font-size:15px;font-weight:800;cursor:pointer}
      .subscription-confirm:disabled{opacity:.6;cursor:wait}
      .subscription-status{font-size:13px;line-height:1.5;margin-top:12px}.subscription-status.error{color:#b42318}.subscription-status.success{color:#167647}
      .subscription-signin{display:inline-block;margin-top:10px;color:#4e5bd5;font-weight:700}
      @media(max-width:480px){.subscription-dialog{padding:21px 17px}.subscription-dialog h2{font-size:23px}}
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.className = 'subscription-modal';
    modal.hidden = true;
    modal.innerHTML = `
      <section class="subscription-dialog" role="dialog" aria-modal="true" aria-labelledby="subscription-title">
        <button type="button" class="subscription-close" aria-label="Close payment window">&times;</button>
        <span class="subscription-eyebrow">TEACHER SUBSCRIPTION</span>
        <h2 id="subscription-title">Complete your payment</h2>
        <div class="subscription-summary"><div><strong id="subscription-price">$10</strong><br><span id="subscription-plan-name">Beginner plan</span></div><span id="subscription-levels">Beginner 1, 2 &amp; 3</span></div>
        <div class="subscription-qr-wrap">
          <img class="subscription-qr" src="${QR_IMAGE_URL}" alt="Payment QR code" loading="eager">
          <strong>Scan the QR code to pay</strong>
          <span class="subscription-note">Pay the displayed amount for your selected plan.</span>
        </div>
        <p class="subscription-note" style="margin-top:14px">After paying, click <strong>I've paid — send for review</strong>. Your request will appear in the administrator's dashboard. Access is activated only after the administrator checks and confirms the payment.</p>
        <p class="subscription-note">Please make the payment from an account whose name or details the administrator can match to your teacher account.</p>
        <a class="subscription-signin" id="subscription-signin" href="account.html#signin" hidden>Sign in to your teacher account</a>
        <button type="button" class="subscription-confirm" id="subscription-submit">I've paid — send for review</button>
        <p class="subscription-status" id="subscription-status" role="status" aria-live="polite"></p>
      </section>`;
    document.body.appendChild(modal);

    const qr = modal.querySelector('.subscription-qr');
    qr.addEventListener('error', () => {
      const note = modal.querySelector('.subscription-qr-wrap .subscription-note');
      note.textContent = 'The QR image could not load. Please contact the administrator.';
      note.classList.add('error');
    });
    const close = () => { modal.hidden = true; document.body.style.overflow = ''; };
    modal.querySelector('.subscription-close').addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) close(); });

    let selectedPlan = 'beginner';
    document.querySelectorAll('[data-subscription-plan]').forEach(button => {
      button.addEventListener('click', async event => {
        event.preventDefault();
        selectedPlan = button.dataset.subscriptionPlan;
        const plan = plans[selectedPlan];
        if (!plan) return;
        document.getElementById('subscription-price').textContent = plan.price;
        document.getElementById('subscription-plan-name').textContent = plan.title + ' plan · monthly';
        document.getElementById('subscription-levels').textContent = plan.levels;
        document.getElementById('subscription-status').textContent = '';
        document.getElementById('subscription-status').className = 'subscription-status';
        document.getElementById('subscription-submit').disabled = false;
        document.getElementById('subscription-submit').textContent = "I've paid — send for review";
        document.getElementById('subscription-signin').hidden = true;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        if (!client) {
          document.getElementById('subscription-status').textContent = 'Payment QR is shown, but account services could not load. Refresh the page to submit a request.';
          document.getElementById('subscription-status').classList.add('error');
          document.getElementById('subscription-submit').disabled = true;
          return;
        }
        const { data: { session } } = await client.auth.getSession();
        if (!session) {
          document.getElementById('subscription-status').textContent = 'Sign in with your teacher account before submitting a payment request.';
          document.getElementById('subscription-status').classList.add('error');
          document.getElementById('subscription-signin').hidden = false;
          document.getElementById('subscription-submit').disabled = true;
          return;
        }
        const { data: profile, error } = await client.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        if (error || profile?.role !== 'teacher') {
          document.getElementById('subscription-status').textContent = 'This subscription is for teacher accounts. Sign in with a teacher account to continue.';
          document.getElementById('subscription-status').classList.add('error');
          document.getElementById('subscription-signin').hidden = false;
          document.getElementById('subscription-submit').disabled = true;
        }
      });
    });

    document.getElementById('subscription-submit').addEventListener('click', async () => {
      const button = document.getElementById('subscription-submit');
      const status = document.getElementById('subscription-status');
      if (!client) {
        status.className = 'subscription-status error';
        status.textContent = 'Account services are unavailable. Refresh the page and try again.';
        return;
      }
      button.disabled = true;
      button.textContent = 'Submitting request…';
      status.className = 'subscription-status';
      status.textContent = '';
      try {
        const { data: { session }, error: sessionError } = await client.auth.getSession();
        if (sessionError || !session) throw new Error('Your session expired. Sign in again, then reopen the plan.');
        const { data, error } = await client.rpc('teacher_request_lesson_access', { p_plan: selectedPlan });
        if (error) throw error;
        status.classList.add('success');
        status.textContent = 'Payment request submitted. Your plan is pending administrator review; access will open after payment is confirmed.';
        button.textContent = 'Request submitted';
      } catch (error) {
        status.classList.add('error');
        status.textContent = error?.message || 'Could not submit the request. Please try again.';
        button.disabled = false;
        button.textContent = "I've paid — send for review";
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
