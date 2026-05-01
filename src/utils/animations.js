import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Check if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if mobile device
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// ============================================
// SCROLL-BASED ANIMATIONS
// ============================================

export const fadeInUp = (element, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    ...options
  };
  
  return gsap.fromTo(element, 
    { y: defaults.y, opacity: 0 },
    { y: 0, opacity: 1, duration: defaults.duration, ease: defaults.ease }
  );
};

export const fadeInLeft = (element, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    x: -50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    ...options
  };
  
  return gsap.fromTo(element,
    { x: defaults.x, opacity: 0 },
    { x: 0, opacity: 1, duration: defaults.duration, ease: defaults.ease }
  );
};

export const fadeInRight = (element, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    x: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    ...options
  };
  
  return gsap.fromTo(element,
    { x: defaults.x, opacity: 0 },
    { x: 0, opacity: 1, duration: defaults.duration, ease: defaults.ease }
  );
};

export const scaleIn = (element, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    ease: 'back.out(1.7)',
    ...options
  };
  
  return gsap.fromTo(element,
    { scale: defaults.scale, opacity: 0 },
    { scale: 1, opacity: 1, duration: defaults.duration, ease: defaults.ease }
  );
};

export const staggerFadeIn = (elements, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    y: 30,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out',
    ...options
  };
  
  return gsap.fromTo(elements,
    { y: defaults.y, opacity: 0 },
    { y: 0, opacity: 1, duration: defaults.duration, stagger: defaults.stagger, ease: defaults.ease }
  );
};

// Scroll-triggered animations
export const scrollFadeIn = (element, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    y: 60,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    trigger: element,
    start: 'top 85%',
    toggleActions: 'play none none reverse',
    ...options
  };
  
  return gsap.fromTo(element,
    { y: defaults.y, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: defaults.duration,
      ease: defaults.ease,
      scrollTrigger: {
        trigger: defaults.trigger,
        start: defaults.start,
        toggleActions: defaults.toggleActions
      }
    }
  );
};

export const scrollScaleIn = (element, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    scale: 0.9,
    opacity: 0,
    duration: 0.6,
    ease: 'back.out(1.7)',
    trigger: element,
    start: 'top 85%',
    toggleActions: 'play none none reverse',
    ...options
  };
  
  return gsap.fromTo(element,
    { scale: defaults.scale, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: defaults.duration,
      ease: defaults.ease,
      scrollTrigger: {
        trigger: defaults.trigger,
        start: defaults.start,
        toggleActions: defaults.toggleActions
      }
    }
  );
};

export const parallaxScroll = (element, speed = 0.5) => {
  if (prefersReducedMotion() || isMobile()) return;
  
  return gsap.to(element, {
    y: () => -window.scrollY * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
};

// ============================================
// HOVER ANIMATIONS
// ============================================

export const hoverLift = (element, options = {}) => {
  if (prefersReducedMotion() || isMobile()) return;
  
  const defaults = {
    y: -8,
    duration: 0.3,
    ease: 'power2.out',
    ...options
  };
  
  const timeline = gsap.timeline({ paused: true });
  
  timeline.to(element, {
    y: defaults.y,
    duration: defaults.duration,
    ease: defaults.ease
  });
  
  element.addEventListener('mouseenter', () => timeline.play());
  element.addEventListener('mouseleave', () => timeline.reverse());
  
  return timeline;
};

export const hoverScale = (element, options = {}) => {
  if (prefersReducedMotion() || isMobile()) return;
  
  const defaults = {
    scale: 1.05,
    duration: 0.3,
    ease: 'power2.out',
    ...options
  };
  
  const timeline = gsap.timeline({ paused: true });
  
  timeline.to(element, {
    scale: defaults.scale,
    duration: defaults.duration,
    ease: defaults.ease
  });
  
  element.addEventListener('mouseenter', () => timeline.play());
  element.addEventListener('mouseleave', () => timeline.reverse());
  
  return timeline;
};

export const hoverGlow = (element, options = {}) => {
  if (prefersReducedMotion() || isMobile()) return;
  
  const defaults = {
    boxShadow: '0 0 30px rgba(204, 255, 0, 0.6)',
    duration: 0.3,
    ease: 'power2.out',
    ...options
  };
  
  const originalShadow = getComputedStyle(element).boxShadow;
  
  const timeline = gsap.timeline({ paused: true });
  
  timeline.to(element, {
    boxShadow: defaults.boxShadow,
    duration: defaults.duration,
    ease: defaults.ease
  });
  
  element.addEventListener('mouseenter', () => timeline.play());
  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      boxShadow: originalShadow,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
  
  return timeline;
};

export const hoverShine = (element, options = {}) => {
  if (prefersReducedMotion() || isMobile()) return;
  
  const defaults = {
    duration: 0.6,
    ease: 'power2.inOut',
    ...options
  };
  
  element.addEventListener('mouseenter', () => {
    const shine = document.createElement('div');
    shine.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      pointer-events: none;
      z-index: 1;
    `;
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(shine);
    
    gsap.to(shine, {
      left: '100%',
      duration: defaults.duration,
      ease: defaults.ease,
      onComplete: () => shine.remove()
    });
  });
};

// ============================================
// MOUSE TRACKING ANIMATIONS
// ============================================

export const mouseTilt = (element, options = {}) => {
  if (prefersReducedMotion() || isMobile()) return;
  
  const defaults = {
    maxTilt: 10,
    duration: 0.3,
    ease: 'power2.out',
    ...options
  };
  
  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -defaults.maxTilt;
    const rotateY = ((x - centerX) / centerX) * defaults.maxTilt;
    
    gsap.to(element, {
      rotateX,
      rotateY,
      duration: defaults.duration,
      ease: defaults.ease,
      transformPerspective: 1000
    });
  });
  
  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      rotateX: 0,
      rotateY: 0,
      duration: defaults.duration,
      ease: defaults.ease
    });
  });
};

export const mouseSpotlight = (element, options = {}) => {
  if (prefersReducedMotion() || isMobile()) return;
  
  const defaults = {
    spotlightSize: 200,
    opacity: 0.15,
    color: '204, 255, 0',
    ...options
  };
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  
  const spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position: absolute;
    width: ${defaults.spotlightSize}px;
    height: ${defaults.spotlightSize}px;
    background: radial-gradient(circle, rgba(${defaults.color}, ${defaults.opacity}) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  element.appendChild(spotlight);
  
  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - defaults.spotlightSize / 2;
    const y = e.clientY - rect.top - defaults.spotlightSize / 2;
    
    gsap.to(spotlight, {
      x,
      y,
      duration: 0.1,
      ease: 'none'
    });
    spotlight.style.opacity = '1';
  });
  
  element.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
};

// ============================================
// CARD ANIMATIONS
// ============================================

export const cardEntrance = (element, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    y: 100,
    opacity: 0,
    scale: 0.9,
    duration: 0.6,
    ease: 'back.out(1.7)',
    ...options
  };
  
  return gsap.fromTo(element,
    { y: defaults.y, opacity: 0, scale: defaults.scale },
    { y: 0, opacity: 1, scale: 1, duration: defaults.duration, ease: defaults.ease }
  );
};

export const cardHover = (element, options = {}) => {
  if (prefersReducedMotion() || isMobile()) return;
  
  const defaults = {
    y: -10,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    duration: 0.3,
    ease: 'power2.out',
    ...options
  };
  
  const originalShadow = getComputedStyle(element).boxShadow;
  
  const timeline = gsap.timeline({ paused: true });
  
  timeline.to(element, {
    y: defaults.y,
    scale: defaults.scale,
    boxShadow: defaults.boxShadow,
    duration: defaults.duration,
    ease: defaults.ease
  });
  
  element.addEventListener('mouseenter', () => timeline.play());
  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      y: 0,
      scale: 1,
      boxShadow: originalShadow,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
  
  return timeline;
};

// ============================================
// BUTTON ANIMATIONS
// ============================================

export const buttonPress = (element, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    scale: 0.95,
    duration: 0.1,
    ease: 'power2.out',
    ...options
  };
  
  element.addEventListener('mousedown', () => {
    gsap.to(element, {
      scale: defaults.scale,
      duration: defaults.duration,
      ease: defaults.ease
    });
  });
  
  element.addEventListener('mouseup', () => {
    gsap.to(element, {
      scale: 1,
      duration: defaults.duration,
      ease: defaults.ease
    });
  });
  
  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      scale: 1,
      duration: defaults.duration,
      ease: defaults.ease
    });
  });
};

export const buttonRipple = (element, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    color: 'rgba(204, 255, 0, 0.4)',
    duration: 0.6,
    ...options
  };
  
  element.addEventListener('click', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      background: ${defaults.color};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    gsap.to(ripple, {
      width: Math.max(rect.width, rect.height) * 2,
      height: Math.max(rect.width, rect.height) * 2,
      opacity: 0,
      duration: defaults.duration,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    });
  });
};

// ============================================
// FOOTER ANIMATIONS
// ============================================

export const footerSlideUp = (element, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    ...options
  };
  
  return gsap.fromTo(element,
    { y: defaults.y, opacity: 0 },
    { y: 0, opacity: 1, duration: defaults.duration, ease: defaults.ease }
  );
};

export const linkHoverUnderline = (element, options = {}) => {
  if (prefersReducedMotion()) return;
  
  const defaults = {
    color: '#CCFF00',
    duration: 0.3,
    ease: 'power2.out',
    ...options
  };
  
  const originalColor = getComputedStyle(element).color;
  
  element.addEventListener('mouseenter', () => {
    gsap.to(element, {
      color: defaults.color,
      duration: defaults.duration,
      ease: defaults.ease
    });
  });
  
  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      color: originalColor,
      duration: defaults.duration,
      ease: defaults.ease
    });
  });
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const cleanupAnimations = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  gsap.globalTimeline.clear();
};

export const refreshScrollTriggers = () => {
  ScrollTrigger.refresh();
};
