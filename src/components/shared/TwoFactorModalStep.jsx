import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { ShieldCheck, ArrowLeft, RefreshCw, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export function TwoFactorModalStep({ email, onVerify, onBack, onResendCode, loading, externalError }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef([]);

  // Focus the first digit input on mount
  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  // Sync external errors if passed from parent
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  // Resend code 60-second timer countdown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only allow single numeric character
    const sanitized = value.replace(/[^0-9]/g, '');
    if (!sanitized) {
      const updatedCode = [...code];
      updatedCode[index] = '';
      setCode(updatedCode);
      return;
    }

    const digit = sanitized.substring(sanitized.length - 1);
    const updatedCode = [...code];
    updatedCode[index] = digit;
    setCode(updatedCode);
    setError('');

    // Auto-advance to next input field
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // If current input is empty, focus and clear previous input
        const updatedCode = [...code];
        updatedCode[index - 1] = '';
        setCode(updatedCode);
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pastedText) {
      const digits = pastedText.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      setCode(newCode);
      setError('');

      // Focus last pasted index or remaining empty field
      const nextIndex = Math.min(digits.length, 5);
      inputsRef.current[nextIndex]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setError('');

    try {
      if (onResendCode) {
        await onResendCode();
      }
      toast.success('A new 2FA verification code has been sent.');
      setResendTimer(60);
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError('');
    onVerify(fullCode);
  };

  const maskedEmail = email
    ? email.replace(/(^.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + '*'.repeat(gp3.length))
    : 'your email';

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1, pb: 1 }}>
      {/* Visual Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
          }}
        >
          <ShieldCheck className="w-7 h-7" />
        </Box>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Two-Factor Authentication
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
          To confirm your password change, please enter the 6-digit code sent to{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{maskedEmail}</strong>.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* 6-Digit Segmented Code Inputs */}
      <Box
        sx={{
          display: 'flex',
          justify: 'center',
          gap: { xs: 1, sm: 1.5 },
          my: 1,
        }}
        onPaste={handlePaste}
      >
        {code.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            disabled={loading}
            aria-label={`Digit ${idx + 1} of 2FA code`}
            style={{
              width: '44px',
              height: '52px',
              textAlign: 'center',
              fontSize: '1.4rem',
              fontWeight: '700',
              borderRadius: '10px',
              border: digit ? '2px solid #3b82f6' : '1.5px solid var(--border-default, #cbd5e1)',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              color: 'var(--text-primary, #0f172a)',
              outline: 'none',
              transition: 'all 0.2s ease-in-out',
              boxShadow: digit ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
            }}
          />
        ))}
      </Box>

      {/* Resend Section */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Didn't receive the code?
        </Typography>
        {resendTimer > 0 ? (
          <Typography variant="body2" color="text.secondary" fontWeight="600">
            Resend in {resendTimer}s
          </Typography>
        ) : (
          <Button
            size="small"
            onClick={handleResend}
            disabled={isResending || loading}
            startIcon={isResending ? <CircularProgress size={12} color="inherit" /> : <RefreshCw className="w-3.5 h-3.5" />}
            sx={{ textTransform: 'none', fontWeight: 600, p: 0.5 }}
          >
            Resend Code
          </Button>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
        <Button
          onClick={onBack}
          disabled={loading}
          variant="outlined"
          startIcon={<ArrowLeft className="w-4 h-4" />}
          sx={{
            flex: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: '#1a6fa8',
              color: '#1a6fa8',
            },
          }}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || code.join('').length < 6}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Lock className="w-4 h-4" />}
          sx={{
            flex: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            bgcolor: '#1a6fa8',
            color: '#ffffff !important',
            '&:hover': {
              bgcolor: '#15578a !important',
              color: '#ffffff !important',
            },
          }}
        >
          {loading ? 'Verifying...' : 'Verify & Save'}
        </Button>
      </Box>
    </Box>
  );
}
