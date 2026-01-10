"use client"

import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { ChevronDown } from "lucide-react"

// Utility function for className merging
function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(" ")
}

// Custom hook for click outside detection
function useClickAway(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
    React.useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return
            }
            handler(event)
        }

        document.addEventListener("mousedown", listener)
        document.addEventListener("touchstart", listener)

        return () => {
            document.removeEventListener("mousedown", listener)
            document.removeEventListener("touchstart", listener)
        }
    }, [ref, handler])
}

// Types
export interface DropdownOption {
    id: string
    label: string
    icon: React.ElementType
    color: string
}

// Icon wrapper with animation
const IconWrapper = ({
    icon: Icon,
    isHovered,
    color,
}: { icon: React.ElementType; isHovered: boolean; color: string }) => (
    <motion.div
        className="w-4 h-4 mr-2 relative"
        initial={false}
        animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
    >
        <Icon className="w-4 h-4" />
        {isHovered && (
            <motion.div
                className="absolute inset-0"
                style={{ color }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                <Icon className="w-4 h-4" strokeWidth={2} />
            </motion.div>
        )}
    </motion.div>
)

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1] as const,
        },
    },
}

interface FluidDropdownProps {
    value: string
    onChange: (value: string) => void
    options: DropdownOption[]
    className?: string
}

// Main component
export function FluidDropdown({ value, onChange, options, className }: FluidDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [hoveredOptionId, setHoveredOptionId] = React.useState<string | null>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    useClickAway(dropdownRef, () => setIsOpen(false))

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsOpen(false)
        }
    }

    const selectedOption = options.find(opt => opt.id === value) || options[0]

    return (
        <MotionConfig reducedMotion="user">
            <div
                className={cn("relative z-[60]", className)}
                ref={dropdownRef}
            >
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center justify-between w-full px-3 h-8 text-sm font-medium rounded-md transition-all duration-200 ease-in-out",
                        "bg-transparent text-white/70 hover:text-white/90 hover:bg-white/5",
                        "focus:outline-none focus:ring-1 focus:ring-white/10",
                        isOpen && "bg-white/10 text-white"
                    )}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    <span className="flex items-center">
                        <IconWrapper
                            icon={selectedOption.icon}
                            isHovered={false}
                            color={selectedOption.color}
                        />
                        {selectedOption.label}
                    </span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center w-5 h-5 ml-2"
                    >
                        <ChevronDown className="w-4 h-4 opacity-50" />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                transition: {
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                    mass: 1,
                                },
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: -10,
                                transition: {
                                    duration: 0.2
                                },
                            }}
                            className="absolute left-0 top-full mt-2 z-50 min-w-[200px]"
                            onKeyDown={handleKeyDown}
                        >
                            <div
                                className="w-full rounded-xl border border-white/10 bg-[#1F2023] p-1 shadow-2xl backdrop-blur-xl"
                            >
                                <motion.div
                                    className="py-1 relative"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {/* Hover Highlight */}
                                    <AnimatePresence>
                                        {(hoveredOptionId || value) && (
                                            <motion.div
                                                layoutId="hover-highlight"
                                                className="absolute left-1 right-1 h-10 bg-white/5 rounded-lg z-0"
                                                initial={false}
                                                animate={{
                                                    y: options.findIndex((c) => (hoveredOptionId || value) === c.id) * 40,
                                                }}
                                                transition={{
                                                    type: "spring",
                                                    bounce: 0.15,
                                                    duration: 0.4,
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {options.map((option) => (
                                        <motion.button
                                            key={option.id}
                                            type="button"
                                            onClick={() => {
                                                onChange(option.id)
                                                setIsOpen(false)
                                            }}
                                            onHoverStart={() => setHoveredOptionId(option.id)}
                                            onHoverEnd={() => setHoveredOptionId(null)}
                                            className={cn(
                                                "relative z-10 flex w-full items-center px-4 py-2.5 text-sm rounded-lg",
                                                "transition-colors duration-150",
                                                "focus:outline-none",
                                                value === option.id || hoveredOptionId === option.id
                                                    ? "text-white"
                                                    : "text-white/50",
                                            )}
                                            whileTap={{ scale: 0.98 }}
                                            variants={itemVariants}
                                        >
                                            <IconWrapper
                                                icon={option.icon}
                                                isHovered={hoveredOptionId === option.id}
                                                color={option.color}
                                            />
                                            {option.label}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MotionConfig>
    )
}
