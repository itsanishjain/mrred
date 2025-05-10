import React, { useState } from "react";

interface MenuOptionProps {
  command: string;
  description: string;
  onClick: () => void;
}

const MenuOption: React.FC<MenuOptionProps> = ({
  command,
  description,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`menu-option ${isHovered ? "hovered" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <span className="command">{command}</span>
      <span className="description">{description}</span>
    </div>
  );
};

export default MenuOption;
