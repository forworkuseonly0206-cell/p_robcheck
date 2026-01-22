// components/layout/header.tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ArrowRight, User, LogOut, LayoutDashboard, Scan as ScanIcon, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
import { LogoLink } from "@/components/ui/logo"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { AuthDialog } from "@/components/auth/auth-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard", authRequired: true },
  { href: "/scan", label: "Scan", authRequired: true },
  { href: "/reports", label: "Reports", authRequired: true },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseReady() || !supabase) {
      setLoading(false)
      return
    }
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
     if (!supabase) return
     console.log('📥 Loading profile for user:', userId)
    const { data, error} = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
      // If profile exists, use it
  if (data) {
    console.log('✅ Profile loaded:', data)
    setProfile(data)
    return
  }
  
  // If profile doesn't exist, create it
  if (error && error.code === 'PGRST116') {
    console.log('⚠️ Profile not found, creating...')
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          plan_type: 'free',
          scans_remaining: 1,
          scans_used: 0,
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('❌ Failed to create profile:', insertError)
      } else {
        console.log('✅ Profile created:', newProfile)
        setProfile(newProfile)
      }
    }
  } else if (error) {
    console.error('❌ Error loading profile:', error)
  }
}
    
  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const openAuthDialog = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setShowAuthDialog(true)
  }

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full glass border-b border-white/5"
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <LogoLink size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              // Hide auth-required items if not logged in
              if (item.authRequired && !user) {
                return null
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-10 w-20 bg-white/5 rounded-lg animate-pulse" />
            ) : user ? (
              // Logged in - Show user menu
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/5">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass border-white/10" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium capitalize">
                          {profile?.plan_type || 'Free'}
                        </span>
                        {profile?.plan_type === 'free' && (
                          <span className="text-xs text-muted-foreground">
                            {profile?.scans_remaining || 0} scan{profile?.scans_remaining !== 1 ? 's' : ''} left
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard'} className="hover:bg-white/5 cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/scan'} className="hover:bg-white/5 cursor-pointer">
                    <ScanIcon className="mr-2 h-4 w-4" />
                    New Scan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/pricing'} className="hover:bg-white/5 cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {profile?.plan_type === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-white/5 cursor-pointer text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Not logged in - Show auth buttons
              <>
                <Button 
                  variant="ghost" 
                  className="hidden md:flex text-muted-foreground hover:text-foreground hover:bg-white/5"
                  onClick={() => openAuthDialog('signin')}
                >
                  Sign In
                </Button>
                <Button 
                  className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 glow-sm group"
                  onClick={() => openAuthDialog('signup')}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="hover:bg-white/5">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass border-white/5 w-80">
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => {
                    if (item.authRequired && !user) {
                      return null
                    }
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-white/5"
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                  
                  {/* Mobile Auth Buttons */}
                  <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-white/10">
                    {user ? (
                      <>
                        <div className="px-4 py-3 rounded-lg bg-white/5">
                          <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-primary mt-1 capitalize">{profile?.plan_type || 'Free'} Plan</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full border-white/10 bg-transparent hover:bg-white/5"
                          onClick={() => window.location.href = '/pricing'}
                        >
                          Upgrade Plan
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full border-red-500/20 bg-transparent hover:bg-red-500/10 text-red-400"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          className="w-full border-white/10 bg-transparent hover:bg-white/5"
                          onClick={() => {
                            setIsOpen(false)
                            openAuthDialog('signin')
                          }}
                        >
                          Sign In
                        </Button>
                        <Button 
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => {
                            setIsOpen(false)
                            openAuthDialog('signup')
                          }}
                        >
                          Get Started
                        </Button>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        mode={authMode}
      />
    </>
  )
}