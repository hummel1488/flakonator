
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isTablet, setIsTablet] = React.useState<boolean>(false)
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
    isMobile, 
    isTablet, 
    isDesktop: !isMobile && !isTablet,
    screenWidth 
  }
}

// This function returns a boolean value for components that
// expect just a boolean rather than the object from useIsMobile()
export function useIsMobile2(): boolean {
  const { isMobile } = useIsMobile()
  return isMobile
}
