import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import './OtpModal.css';

// 2fa otp verification modal component
export default function OtpModal({
  email,
  onVerifySuccess,
  onClose
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);

  // auto focus first input field
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendTimer]);

  // handle single digit input change
  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError('');

    // jump to next field if value entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // handle backspace navigation across inputs
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  // handle paste full code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const split = pasted.split('');
      setDigits(split);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  // handle verification submission
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setError('please enter all 6 digits of the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/2fa/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onVerifySuccess(data);
      } else {
        setError(data.error || 'invalid or expired code, please try again');
      }
    } catch (err) {
      setError('unable to verify code, please check your network connection');
    } finally {
      setLoading(false);
    }
  };

  // handle resend code request
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/2fa/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('new verification code sent to your email!');
        setResendTimer(30);
      } else {
        setError(data.error || 'failed to resend verification code');
      }
    } catch (err) {
      setError('unable to resend code, please try again later');
    }
  };

  return (
    <div className="otp-modal-backdrop" onClick={onClose}>
      <div className="otp-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="otp-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="otp-icon-bubble">
          <ShieldCheck size={32} />
        </div>

        <h3>Two-Factor Verification</h3>
        <p className="otp-modal-subtitle">
          We have sent a 6-digit verification code to your registered email: <br />
          <span className="otp-email-highlight">{email}</span>
        </p>

        {error && <div className="otp-error-banner">{error}</div>}
        {successMessage && <div className="otp-success-banner">{successMessage}</div>}

        <form onSubmit={handleVerify}>
          <div className="otp-inputs-grid" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="otp-digit-field"
                autoComplete="off"
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn-otp-verify"
            disabled={loading || digits.join('').length !== 6}
          >
            {loading ? 'Verifying Code...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="otp-resend-row">
          <span>Didn't receive the email?</span>
          <button
            type="button"
            className="btn-resend-link"
            onClick={handleResend}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
