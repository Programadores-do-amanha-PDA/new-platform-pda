import { useInView, useMotionValue, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';

interface CountUpProps {
  readonly to: number;
  readonly from?: number;
  readonly direction?: 'up' | 'down';
  readonly delay?: number;
  readonly duration?: number;
  readonly className?: string;
  readonly startWhen?: boolean;
  readonly separator?: string;
  readonly onStart?: () => void;
  readonly onEnd?: () => void;
}

/**
 * CountUp Component
 * 
 * Animates a numeric value from one number to another using spring physics.
 * The animation triggers when the component enters the viewport.
 * 
 * @component
 * @example
 * <CountUp to={100} from={0} duration={2} />
 * 
 * @param {Object} props - The component props
 * @param {number} props.to - The target number to count up/down to
 * @param {number} [props.from=0] - The starting number
 * @param {'up' | 'down'} [props.direction='up'] - Count direction
 * @param {number} [props.delay=0] - Delay before animation starts in seconds
 * @param {number} [props.duration=2] - Animation duration in seconds
 * @param {string} [props.className=''] - CSS class name for the span element
 * @param {boolean} [props.startWhen=true] - Whether to start animation when in view
 * @param {string} [props.separator=''] - Thousands separator character (e.g., '.' or ',')
 * @param {() => void} [props.onStart] - Callback fired when animation starts
 * @param {() => void} [props.onEnd] - Callback fired when animation ends
 * @returns {JSX.Element} A span element displaying the animated count
 */
export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? to : from);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, {
    damping,
    stiffness
  });

  const isInView = useInView(ref, { once: true, margin: '0px' });

  const getDecimalPlaces = (num: number): number => {
    const str = num.toString();
    if (str.includes('.')) {
      const decimals = str.split('.')[1];
      if (parseInt(decimals) !== 0) {
        return decimals.length;
      }
    }
    return 0;
  };

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    (latest: number) => {
      const hasDecimals = maxDecimals > 0;

      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0
      };

      const formattedNumber = Intl.NumberFormat('en-US', options).format(latest);

      return separator ? formattedNumber.replace(/,/g, separator) : formattedNumber;
    },
    [maxDecimals, separator]
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(direction === 'down' ? to : from);
    }
  }, [from, to, direction, formatValue]);

  useEffect(() => {
    if (isInView && startWhen) {
      if (typeof onStart === 'function') {
        onStart();
      }

      const timeoutId = setTimeout(() => {
        motionValue.set(direction === 'down' ? from : to);
      }, delay * 1000);

      const durationTimeoutId = setTimeout(
        () => {
          if (typeof onEnd === 'function') {
            onEnd();
          }
        },
        delay * 1000 + duration * 1000
      );

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(durationTimeoutId);
      };
    }
  }, [isInView, startWhen, motionValue, direction, from, to, delay, onStart, onEnd, duration]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest: number) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest);
      }
    });

    return () => unsubscribe();
  }, [springValue, formatValue]);

  return <span className={className} ref={ref} />;
}
