// components/settings/PasswordChangeModal.tsx  (COMPLETE FILE - replace the old one)
// CHANGED: you must now enter your CURRENT password, and the server knows who you are
// from your login (no user id is sent). Restyled to the site's new colors.

'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import { authFetch } from '@/lib/auth-fetch'

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PasswordChangeModal({ isOpen, onClose, onSuccess }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!currentPassword) {
      setError('Please enter your current password')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      setError('Password must be between 8 and 72 characters')
      return
    }

    setLoading(true)

    try {
      const response = await authFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      onSuccess()
      handleClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
    onClose()
  }

  const passwordStrength = newPassword.length >= 12 ? 'Strong' :
                          newPassword.length >= 8 ? 'Good' :
                          newPassword.length > 0 ? 'Weak' : ''

  const strengthColor = passwordStrength === 'Strong' ? 'text-green-600' :
                       passwordStrength === 'Good' ? 'text-yellow-600' :
                       'text-red-600'

  const inputClass =
    'w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground pr-12'
  const eyeClass = 'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Change Password
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            You stay signed in on this device. Any other device will be signed out.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                placeholder="Enter your current password"
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className={eyeClass}>
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="Enter new password"
                autoComplete="new-password"
                required
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className={eyeClass}>
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">At least 8 characters</p>
              {passwordStrength && (
                <p className={`text-xs font-medium ${strengthColor}`}>
                  {passwordStrength}
                </p>
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className={eyeClass}>
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary/70 text-foreground rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}