import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useChangePassword } from '@/hooks/useAuth'
import { changePasswordSchema, type ChangePasswordInput } from '@linkvault/shared'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import { generateSecurePassword } from '@/lib/password'
import { toast } from 'sonner'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const changePasswordMutation = useChangePassword()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const { register, handleSubmit, formState: { errors, isValid }, reset, setValue, trigger } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  })

  const onSubmit = (data: ChangePasswordInput) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(onSubmit)(e)
  }

  const generateSafePassword = async () => {
    try {
      setShowResult(Boolean(generatedPassword))
      setIsGenerating(true)
      setCopied(false)
      await new Promise((r) => setTimeout(r, 500))
      const password = generateSecurePassword(16)
      setGeneratedPassword(password)
      setShowResult(true)
      setValue('newPassword', password, { shouldValidate: true, shouldDirty: true })
      await trigger('newPassword')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedPassword) return
    try {
      await navigator.clipboard.writeText(generatedPassword)
      setCopied(true)
      toast.success('Copied successfully')
      setTimeout(() => setCopied(false), 1500)
    } catch {
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      reset()
      setShowCurrent(false)
      setShowNew(false)
      setIsGenerating(false)
      setGeneratedPassword(null)
      setCopied(false)
      setShowResult(false)
    }, 220)
  }

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Password"
      description="Update your account password"
      actionButton={
        <Button type="submit" form="change-password-form" className="flex-1" disabled={changePasswordMutation.isPending || !isValid || isGenerating}>
          Save
        </Button>
      }
      onCancel={onClose}
      cancelText="Cancel"
    >
      <form id="change-password-form" onSubmit={handleFormSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={changePasswordMutation.isPending}
              {...register('currentPassword')}
            />
            <button
              type="button"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-2 top-2.5 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm font-medium text-destructive">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNew ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={changePasswordMutation.isPending}
              {...register('newPassword')}
            />
            <button
              type="button"
              aria-label={showNew ? 'Hide password' : 'Show password'}
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-2 top-2.5 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-sm font-medium text-destructive">{errors.newPassword.message}</p>
          )}
          <div className="pt-2">
            <Button type="button" variant="secondary" onClick={generateSafePassword} disabled={isGenerating || changePasswordMutation.isPending}>
              {isGenerating ? 'Generating…' : 'Generate safe password'}
            </Button>
          </div>
        </div>
        {showResult && (generatedPassword || isGenerating) && (
          <div
            className={`rounded-md border bg-green-50 text-green-900 p-3 text-sm flex items-center justify-between gap-3 ${isGenerating ? 'opacity-60 pointer-events-none' : ''}`}
            aria-disabled={isGenerating}
          >
            <div>
              <p className="font-medium">Secure password generated successfully</p>
              <p className="font-mono break-all">{generatedPassword}</p>
            </div>
            <Button type="button" variant="outline" onClick={handleCopy} className="shrink-0" disabled={isGenerating}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-2">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        )}
        <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
          Use at least 6 characters. Prefer a strong password with a mix of letters, numbers, and symbols.
        </div>

  
      </form>
    </ResponsiveModal>
  )
}


