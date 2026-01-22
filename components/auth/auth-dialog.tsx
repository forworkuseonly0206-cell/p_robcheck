// components/auth/auth-dialog.tsx
'use client'

import { useState } from 'react'
import { supabase, isSupabaseReady } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'signin' | 'signup'
}

type AuthStep = 'email' | 'otp' | 'signup-details' | 'password'

export function AuthDialog({ open, onOpenChange, mode = 'signin' }: AuthDialogProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(mode)
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const resetForm = () => {
    setEmail('')
    setOtp('')
    setFullName('')
    setPassword('')
    setShowPassword(false)
    setError(null)
    setSuccess(null)
    setStep('email')
  }

  // Sign Up Flow: Email → OTP → Name → Password
  const handleSignUpEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseReady() || !supabase) {
      setError('Authentication service is not configured')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!email) {
        setError('Email is required')
        setLoading(false)
        return
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single()

      if (existingUser) {
        setError('An account with this email already exists. Please sign in.')
        setLoading(false)
        return
      }

      // Generate and send OTP via API route
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'signup' }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP')
        setLoading(false)
        return
      }

      setStep('otp')
      setSuccess('Check your email for the 6-digit verification code!')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP for signup
  const handleVerifySignUpOTP = async () => {
    if (!isSupabaseReady() || !supabase) {
      setError('Authentication service is not configured')
      return
    }

    if (otp.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Verify OTP via API route
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: 'signup' }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid or expired code')
        setLoading(false)
        return
      }

      // OTP verified, move to name entry
      setStep('signup-details')
      setSuccess('Email verified! Please complete your profile.')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle name entry
  const handleSignupDetails = () => {
    if (!fullName.trim()) {
      setError('Please enter your name')
      return
    }
    setError(null)
    setSuccess(null)
    setStep('password')
  }

  // Complete signup with password
  const handleCompleteSignup = async () => {
    if (!isSupabaseReady() || !supabase) {
      setError('Authentication service is not configured')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create user with password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: undefined, // Disable email confirmation link
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            plan_type: 'free',
            scans_remaining: 1,
            scans_used: 0,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // Send welcome email
        try {
          await fetch('/api/email/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.user.email,
              name: fullName,
            }),
          })
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
        }

        setSuccess('✅ Account created! Redirecting...')
        
        setTimeout(() => {
          onOpenChange(false)
          window.location.reload()
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Sign In Flow: Email → Password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseReady() || !supabase) {
      setError('Authentication service is not configured')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!email || !password) {
        setError('Email and password are required')
        setLoading(false)
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      if (data.user) {
        setSuccess('✅ Success! Redirecting...')
        
        setTimeout(() => {
          onOpenChange(false)
          window.location.reload()
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
          <DialogDescription>
            {authMode === 'signin' && 'Enter your credentials to access your account'}
            {authMode === 'signup' && step === 'email' && 'Get started with a free account'}
            {authMode === 'signup' && step === 'otp' && 'Enter the 6-digit code we sent to your email'}
            {authMode === 'signup' && step === 'signup-details' && 'Tell us your name'}
            {authMode === 'signup' && step === 'password' && 'Create a secure password'}
          </DialogDescription>
        </DialogHeader>

        {/* SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-primary hover:underline"
                disabled={loading}
              >
                Sign up
              </button>
            </div>
          </form>
        )}

        {/* SIGN UP - Email Step */}
        {authMode === 'signup' && step === 'email' && (
          <form onSubmit={handleSignUpEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                'Sending code...'
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Verification Code
                </>
              )}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-primary hover:underline"
                disabled={loading}
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* SIGN UP - OTP Verification Step */}
        {authMode === 'signup' && step === 'otp' && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('email')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="space-y-2">
              <Label>Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Code sent to {email}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleVerifySignUpOTP} 
              className="w-full" 
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleSignUpEmail}
                className="text-sm text-primary hover:underline"
                disabled={loading}
              >
                Resend code
              </button>
            </div>
          </div>
        )}

        {/* SIGN UP - Name Entry Step */}
        {authMode === 'signup' && step === 'signup-details' && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('otp')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleSignupDetails} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {/* SIGN UP - Password Step */}
        {authMode === 'signup' && step === 'password' && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('signup-details')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Create Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleCompleteSignup} 
              className="w-full" 
              disabled={loading || password.length < 8}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}