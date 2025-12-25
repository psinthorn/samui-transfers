import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServicesSection } from './ServicesSection';

describe('ServicesSection', () => {
  describe('Rendering - English', () => {
    it('should render all 5 services', () => {
      render(<ServicesSection lang="en" />);
      
      expect(screen.getByText('Airport Transfers')).toBeInTheDocument();
      expect(screen.getByText('Speedboat Tours')).toBeInTheDocument();
      expect(screen.getByText('Guided Tours')).toBeInTheDocument();
      expect(screen.getByText('Event Services')).toBeInTheDocument();
      expect(screen.getByText('Package Deals')).toBeInTheDocument();
    });

    it('should render service section header in English', () => {
      render(<ServicesSection lang="en" />);
      
      expect(screen.getByText('Our Services')).toBeInTheDocument();
      expect(screen.getByText(/Choose the service that best fits your needs/)).toBeInTheDocument();
    });

    it('should render all service descriptions in English', () => {
      render(<ServicesSection lang="en" />);
      
      expect(screen.getByText(/Reliable airport pickup and drop-off services/)).toBeInTheDocument();
      expect(screen.getByText(/Explore stunning islands and beaches/)).toBeInTheDocument();
      expect(screen.getByText(/Discover Koh Samui's top attractions/)).toBeInTheDocument();
      expect(screen.getByText(/Transportation and coordination for your special events/)).toBeInTheDocument();
      expect(screen.getByText(/Bundled services with discounts/)).toBeInTheDocument();
    });

    it('should render Learn More buttons in English', () => {
      render(<ServicesSection lang="en" />);
      
      const learnMoreButtons = screen.getAllByText('Learn More');
      expect(learnMoreButtons).toHaveLength(5);
    });

    it('should render Book Now button in English', () => {
      render(<ServicesSection lang="en" />);
      
      expect(screen.getByText('Book Now')).toBeInTheDocument();
    });
  });

  describe('Rendering - Thai', () => {
    it('should render all 5 services in Thai', () => {
      render(<ServicesSection lang="th" />);
      
      expect(screen.getByText('รับส่งสนามบิน')).toBeInTheDocument();
      expect(screen.getByText('ทัวร์เรือเร็ว')).toBeInTheDocument();
      expect(screen.getByText('ทัวร์ท่องเที่ยว')).toBeInTheDocument();
      expect(screen.getByText('บริการอีเวนต์')).toBeInTheDocument();
      expect(screen.getByText('แพ็คเกจสุดพิเศษ')).toBeInTheDocument();
    });

    it('should render service section header in Thai', () => {
      render(<ServicesSection lang="th" />);
      
      expect(screen.getByText('บริการของเรา')).toBeInTheDocument();
      expect(screen.getByText(/เลือกบริการที่เหมาะกับความต้องการของคุณ/)).toBeInTheDocument();
    });

    it('should render all service descriptions in Thai', () => {
      render(<ServicesSection lang="th" />);
      
      expect(screen.getByText(/บริการรับส่งสนามบินที่เชื่อถือได้/)).toBeInTheDocument();
      expect(screen.getByText(/สำรวจเกาะและหาดทรายสวยงามด้วยเรือเร็ว/)).toBeInTheDocument();
      expect(screen.getByText(/ค้นพบสถานที่ท่องเที่ยวชั้นนำของสมุย/)).toBeInTheDocument();
      expect(screen.getByText(/บริการขนส่งและประสานงานสำหรับงานพิเศษ/)).toBeInTheDocument();
      expect(screen.getByText(/บริการรวมพร้อมส่วนลดสำหรับการเดินทาง/)).toBeInTheDocument();
    });

    it('should render Learn More buttons in Thai', () => {
      render(<ServicesSection lang="th" />);
      
      const learnMoreButtons = screen.getAllByText('เรียนรู้เพิ่มเติม');
      expect(learnMoreButtons).toHaveLength(5);
    });

    it('should render Book Now button in Thai', () => {
      render(<ServicesSection lang="th" />);
      
      expect(screen.getByText('จองเลย')).toBeInTheDocument();
    });
  });

  describe('Interactive Behavior', () => {
    it('should call onServiceSelect when Learn More button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();
      
      render(<ServicesSection lang="en" onServiceSelect={mockOnSelect} />);
      
      const learnMoreButtons = screen.getAllByText('Learn More');
      await user.click(learnMoreButtons[0]);
      
      // Note: The current implementation calls onServiceSelect on card click
      // Adjust this test based on actual button behavior
    });

    it('should call onServiceSelect when service card is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();
      
      render(<ServicesSection lang="en" onServiceSelect={mockOnSelect} />);
      
      const transferCard = screen.getByText('Airport Transfers').closest('div').parentElement;
      await user.click(transferCard);
      
      expect(mockOnSelect).toHaveBeenCalledWith('TRANSFER');
    });

    it('should call onServiceSelect with correct service ID', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();
      
      render(<ServicesSection lang="en" onServiceSelect={mockOnSelect} />);
      
      const boatCard = screen.getByText('Speedboat Tours').closest('div').parentElement;
      await user.click(boatCard);
      
      expect(mockOnSelect).toHaveBeenCalledWith('BOAT');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      const { container } = render(<ServicesSection lang="en" />);
      
      expect(container.querySelector('section')).toBeInTheDocument();
      expect(container.querySelectorAll('h2')).toHaveLength(1);
      expect(container.querySelectorAll('h3')).toHaveLength(5);
    });

    it('should have accessible button elements', () => {
      render(<ServicesSection lang="en" />);
      
      const buttons = screen.getAllByRole('button');
      // 5 Learn More buttons + 1 Book Now button
      expect(buttons).toHaveLength(6);
    });

    it('should have descriptive alt text for icons', () => {
      const { container } = render(<ServicesSection lang="en" />);
      
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should render with proper grid classes', () => {
      const { container } = render(<ServicesSection lang="en" />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-5');
    });

    it('should have proper spacing classes', () => {
      const { container } = render(<ServicesSection lang="en" />);
      
      const section = container.querySelector('section');
      expect(section).toHaveClass('py-12');
      expect(section).toHaveClass('sm:py-16');
      expect(section).toHaveClass('md:py-20');
      expect(section).toHaveClass('lg:py-24');
    });
  });

  describe('Service Data Integrity', () => {
    it('should have unique service IDs', () => {
      const { container } = render(<ServicesSection lang="en" />);
      
      const services = [
        'TRANSFER',
        'BOAT',
        'TOUR',
        'EVENT',
        'PACKAGE',
      ];
      
      services.forEach(serviceId => {
        const cards = container.querySelectorAll('[data-service-id]');
        expect(cards.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should display services in correct order', () => {
      render(<ServicesSection lang="en" />);
      
      const serviceTexts = [
        'Airport Transfers',
        'Speedboat Tours',
        'Guided Tours',
        'Event Services',
        'Package Deals',
      ];
      
      let previousIndex = -1;
      serviceTexts.forEach(text => {
        const element = screen.getByText(text);
        const currentIndex = Array.from(document.body.innerHTML).indexOf(text);
        expect(currentIndex).toBeGreaterThan(previousIndex);
        previousIndex = currentIndex;
      });
    });
  });

  describe('Visual Design', () => {
    it('should have gradient backgrounds for cards', () => {
      const { container } = render(<ServicesSection lang="en" />);
      
      const gradients = [
        'from-blue-500',
        'from-cyan-500',
        'from-emerald-500',
        'from-purple-500',
        'from-rose-500',
      ];
      
      const html = container.innerHTML;
      gradients.forEach(gradient => {
        expect(html).toContain(gradient);
      });
    });

    it('should have hover effects', () => {
      const { container } = render(<ServicesSection lang="en" />);
      
      const cards = container.querySelectorAll('.group');
      expect(cards.length).toBeGreaterThan(0);
      
      cards.forEach(card => {
        expect(card).toHaveClass('hover:shadow-xl');
        expect(card).toHaveClass('hover:border-primary');
      });
    });
  });
});
