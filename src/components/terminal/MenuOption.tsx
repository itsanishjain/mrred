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
      <div className="command">{command}</div>
      <div className="description">{description}</div>
    </div>
  );
};

export default MenuOption;
