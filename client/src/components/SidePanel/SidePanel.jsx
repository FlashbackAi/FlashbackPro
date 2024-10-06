import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Home, MessageSquare, Wallet, Users, Folder, Archive, HelpCircle, Settings } from 'lucide-react';

const NavBar = styled(motion.nav)`
  position: fixed;
  top: 75px;
  left: 0;
  background: none;
  border-radius: 0 10px 10px 0;
  padding: 16px 0;
  box-shadow: 0 0 40px rgba(0,0,0,0.1);
  height: calc(100vh - 75px);
  width: 80px;
  z-index: 1000;
  overflow: visible;
`;

const NavMenu = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 16px;
  position: relative;
`;

const NavLink = styled(motion.a)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  color: ${({ active }) => (active ? '#00ffff' : '#ffffff')};
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 0 8px;

  ${({ active }) => active && `
    background-color: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  `}

  &:hover {
    background-color: rgba(0, 255, 255, 0.1);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const HoverLabel = styled(motion.span)`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background-color: #00ffff;
  color: #1e1e1e;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1001;
`;

const SidePanel = ({ activeTab, setActiveTab, isOpen }) => {
  const navItems = [
    { icon: Home, id: 'flashbacks', label: 'Flashbacks' },
    { icon: Users, id: 'Profile', label: 'Profile' },
    { icon: Wallet, id: 'Wallet', label: 'Wallet' },
    { icon: Folder, id: 'projects', label: 'Projects' },
    { icon: Archive, id: 'resources', label: 'Resources' },
    { icon: HelpCircle, id: 'help', label: 'Help' },
    { icon: Settings, id: 'settings', label: 'Settings' },
  ];

  return (
    <NavBar
      isOpen={isOpen}
      initial={false}
      animate={{ width: isOpen ? '80px' : '0' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <NavMenu>
        {navItems.map((item) => (
          <NavItem key={item.id}>
            <NavLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.id);
              }}
              active={activeTab === item.id}
              whileHover="hover"
            >
              <item.icon size={24} />
              <HoverLabel
                initial={{ opacity: 0, x: -10 }}
                variants={{
                  hover: { opacity: 1, x: 10 }
                }}
              >
                {item.label}
              </HoverLabel>
            </NavLink>
          </NavItem>
        ))}
      </NavMenu>
    </NavBar>
  );
};

export default SidePanel;