import { CalendarIcon, TicketIcon, UsersIcon } from 'lucide-react';

export const featuresData = [
    {
        icon: <CalendarIcon className="w-6 h-6" />,
        title: 'Event Creation',
        desc: 'Create and customize events with ease. Set dates, pricing, capacity, and manage all event details in one place.'
    },
    {
        icon: <TicketIcon className="w-6 h-6" />,
        title: 'Ticket Booking',
        desc: 'Seamless ticket booking experience for attendees. Secure payments, instant confirmations, and easy check-ins.'
    },
    {
        icon: <UsersIcon className="w-6 h-6" />,
        title: 'Attendee Management',
        desc: 'Manage registrations, track attendance, send updates, and communicate with your event attendees effortlessly.'
    }
];

export const plansData = [
    {
        id: 'starter',
        name: 'Basic',
        price: '₹10',
        desc: 'Perfect for small events and workshops.',
        credits: 'Per event',
        features: [
            'Up to 50 attendees',
            'Basic event creation',
            'Ticket booking system',
            'Email notifications',
            'Basic analytics'
        ]
    },
    {
        id: 'pro',
        name: 'Professional',
        price: '₹100',
        desc: 'Ideal for conferences and medium events.',
        credits: 'Per event',
        features: [
            'Up to 200 attendees',
            'Advanced event customization',
            'Priority support',
            'Advanced analytics',
            'Custom branding',
            'Mobile check-in app'
        ],
        popular: true
    },
    {
        id: 'ultra',
        name: 'Enterprise',
        price: '₹150',
        desc: 'For large-scale events and organizations.',
        credits: 'Per event',
        features: [
            'Unlimited attendees',
            'White-label solution',
            'Dedicated support manager',
            'API access',
            'Multi-event management',
            'Custom integrations'
        ]
    }
];

export const faqData = [
    {
        question: 'How do I create an event on your platform?',
        answer: 'Simply sign up, click "Create Event", and fill in the details like event name, date, location, pricing, and capacity. You can customize your event page with images and descriptions.'
    },
    {
        question: 'What payment methods are supported for ticket bookings?',
        answer: 'We support all major credit cards, debit cards, UPI, net banking, and popular digital wallets. Payment processing is secure and instant.'
    },
    {
        question: 'Can I manage attendee registrations and check-ins?',
        answer: 'Yes! Our platform provides comprehensive attendee management tools including registration tracking, QR code check-ins, attendee lists, and communication features.'
    },
    {
        question: 'Is there a limit on the number of attendees for events?',
        answer: 'Attendee limits depend on your pricing plan. Basic plans support up to 50 attendees, Professional plans up to 200, and Enterprise plans have unlimited attendees.'
    }
];

export const footerLinks = [
    {
        title: "Platform",
        links: [
            { name: "Home", url: "#" },
            { name: "Events", url: "/events" },
            { name: "Pricing", url: "#pricing" },
            { name: "About", url: "#" }
        ]
    },
    {
        title: "Support",
        links: [
            { name: "Help Center", url: "#" },
            { name: "Contact Us", url: "#" },
            { name: "Privacy Policy", url: "/privacy-policy" },
            { name: "Terms of Service", url: "/terms-of-service" }
        ]
    },
    {
        title: "Connect",
        links: [
            { name: "Twitter", url: "#" },
            { name: "LinkedIn", url: "#" },
            { name: "Instagram", url: "#" }
        ]
    }
];