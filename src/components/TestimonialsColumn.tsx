import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

export interface Testimonial {
    id: number;
    name: string;
    role: string;
    image: string | null;
    content: string;
    rating: number;
    exam: string;
}

export const TestimonialsColumn = (props: {
    className?: string;
    testimonials: Testimonial[];
    duration?: number;
}) => {
    return (
        <div className={props.className}>
            <motion.div
                animate={{
                    translateY: "-50%",
                }}
                transition={{
                    duration: props.duration || 10,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                }}
                className="flex flex-col gap-6 pb-6"
            >
                {[
                    ...new Array(2).fill(0).map((_, index) => (
                        <React.Fragment key={index}>
                            {props.testimonials.map(({ content, image, name, role, exam }, i) => (
                                <div className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow" key={i}>
                                    <p className="text-slate-600 leading-relaxed mb-4 text-sm font-medium">"{content}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 overflow-hidden">
                                            {image ? (
                                                <img src={image} alt={name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-indigo-400" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="font-bold text-slate-900 text-sm">{name}</div>
                                            <div className="text-xs text-slate-400 font-medium tracking-wide">
                                                {role} • <span className="text-amber-500">{exam}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    )),
                ]}
            </motion.div>
        </div>
    );
};
