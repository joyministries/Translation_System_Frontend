import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { X } from 'lucide-react';
import { MdMarkEmailRead } from 'react-icons/md';
import { authAPI } from '../../api/auth';
import { useAuthStore } from '../../store/auth_store';
import toast from 'react-hot-toast';

export function EditUserDialog({ open, onClose, user, onSave }) {
  const { setAuthData } = useAuthStore();

  const [step, setStep] = useState('form'); // 'form' | 'inbox_sent'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when dialog opens or user prop changes
  useEffect(() => {
    if (open) {
      setStep('form');
      setFullName(user?.full_name || user?.name || '');
      setEmail(user?.email || '');
      setChangePassword(false);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setError('');
    }
  }, [open, user]);

  const handleDialogClose = (event, reason) => {
    if (reason === 'backdropClick') {
      return;
    }
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (changePassword) {
      if (!password) {
        setError('Please enter a new password.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      // Update basic profile details (Name & Email)
      const payload = {
        full_name: fullName.trim(),
        email: email.trim(),
      };

      const response = await authAPI.updateProfile(payload);
      const updatedUser = response?.user || response?.data || {
        ...user,
        full_name: fullName.trim(),
        email: email.trim()
      };

      // Update Zustand auth store
      setAuthData(updatedUser);

      if (onSave) {
        onSave(updatedUser);
      }

      // If user chose to change password, trigger /verify-password-change email link
      if (changePassword) {
        await authAPI.requestPasswordChangeVerification({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          password_confirmation: confirmPassword,
        });

        setStep('inbox_sent');
        toast.success('Kindly check inbox to verify password change', { duration: 6000 });
      } else {
        toast.success('Profile updated successfully.');
        onClose();
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to update profile or send password verification. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyleProps = {
    '& .MuiOutlinedInput-root': {
      bgcolor: '#ffffff',
      color: '#0f172a',
      borderRadius: 2,
      '& fieldset': { borderColor: 'var(--border-default, #cbd5e1)' },
      '&:hover fieldset': { borderColor: '#1a6fa8' },
      '&.Mui-focused fieldset': { borderColor: '#1a6fa8' },
    },
    '& .MuiInputBase-input': { color: '#0f172a' },
    '& .MuiInputBase-input::placeholder': { color: '#64748b', opacity: 1 },
    '& .MuiInputLabel-root': { color: 'var(--text-secondary, #475569)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1a6fa8' },
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'text.primary' }}>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          {step === 'inbox_sent' ? 'Check Your Inbox' : 'Edit Profile'}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="close" sx={{ color: 'text.secondary' }}>
          <X className="w-5 h-5" />
        </IconButton>
      </DialogTitle>

      {step === 'inbox_sent' ? (
        <Box sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(26, 111, 168, 0.1)',
              color: '#1a6fa8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MdMarkEmailRead size={36} />
          </Box>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Kindly check inbox to verify password change
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ leading: 1.6 }}>
            A verification link has been sent to your email address (<strong>{email}</strong>). Please check your inbox and click the link to confirm your new password.
          </Typography>
          <Button
            onClick={onClose}
            variant="contained"
            fullWidth
            sx={{
              mt: 1,
              bgcolor: '#1a6fa8',
              color: '#ffffff !important',
              fontWeight: 700,
              py: 1.2,
              '&:hover': {
                bgcolor: '#15578a !important',
              },
            }}
          >
            Got it, thanks!
          </Button>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, borderColor: 'divider' }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              required
              variant="outlined"
              size="small"
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              sx={inputStyleProps}
            />

            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              variant="outlined"
              size="small"
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              sx={inputStyleProps}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={changePassword}
                  onChange={(e) => {
                    setChangePassword(e.target.checked);
                    if (!e.target.checked) {
                      setPassword('');
                      setConfirmPassword('');
                      setShowPassword(false);
                    }
                  }}
                  disabled={loading}
                  color="primary"
                />
              }
              label={<Typography variant="body2" color="text.primary">Change password</Typography>}
            />

            {changePassword && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
                <TextField
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                  sx={inputStyleProps}
                />
                <TextField
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                  sx={inputStyleProps}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      disabled={loading}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body2" color="text.primary">Show password</Typography>}
                />
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={onClose}
              disabled={loading}
              variant="text"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#1a6fa8',
                color: '#ffffff !important',
                fontWeight: 700,
                px: 3,
                '&:hover': {
                  bgcolor: '#15578a !important',
                  color: '#ffffff !important',
                },
              }}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}
