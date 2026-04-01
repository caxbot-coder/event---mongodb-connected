import { ChevronDownIcon } from 'lucide-react';
import Title from './Title';
import { useState } from 'react';
import { faqData } from '@/data/dummy-data';

export default function Faq() {
    const [openItem, setOpenItem] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenItem(openItem === index ? null : index);
    };

    return (
        <section id="faq" className="py-20 2xl:py-32">
            <div className="max-w-3xl mx-auto px-4">

                <Title
                    title="FAQ"
                    heading="Frequently asked questions"
                    description="Everything you need to know about our event booking platform. If you have more questions, feel free to reach out."
                />

                <div className="space-y-3">
                    {faqData.map((faq, i) => (
                        <div
                            key={i}
                            className="bg-white/6 rounded-xl select-none overflow-hidden"
                        >
                            <div
                                className={`border rounded-xl transition-all duration-200 ${
                                    openItem === i 
                                        ? 'bg-white/8 border-white/20' 
                                        : 'border-transparent'
                                }`}
                            >
                                <button
                                    onClick={() => toggleItem(i)}
                                    className="flex items-center justify-between p-4 cursor-pointer w-full text-left hover:bg-white/5 transition-colors duration-150"
                                >
                                    <h4 className="font-medium text-white">{faq.question}</h4>
                                    <div
                                        className={`transition-transform duration-200 ${
                                            openItem === i ? 'rotate-180' : ''
                                        }`}
                                    >
                                        <ChevronDownIcon className="w-5 h-5 text-gray-300" />
                                    </div>
                                </button>
                                
                                <div
                                    className={`overflow-hidden transition-all duration-200 ${
                                        openItem === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <p className="p-4 pt-0 text-sm text-gray-300 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};