
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)
  const [screenWidth, setScreenWidth] = React.useState<number>(0)

  React.useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth
      setScreenWidth(width)
      setIsMobile(width < MOBILE_BREAKPOINT)
      setIsTablet(width >= MOBILE_BREAKPOINT && width < 1024)
    }

    // Initial check
    updateSizes()

    // Event listener for window resize
    window.addEventListener("resize", updateSizes)
    
    return () => window.removeEventListener("resize", updateSizes)
  }, [])

  return { 
    isMobile: !!isMobile, 
    isTablet: !!isTablet, 
    isDesktop: !isMobile && !isTablet,
    screenWidth 
  }
}

// This overload allows using useIsMobile() as a boolean for backward compatibility
// with components like the sidebar that expect just a boolean
export function useIsMobile2(): boolean {
  const { isMobile } = useIsMobile()
  return isMobile
}
