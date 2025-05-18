import Link from 'next/link';
import '../src/styles/customCard.css';

export default function DashboardCard3({ title, value, description, link, bgColor, promotion }) {
  return (
    <div className={`cardC compare ${bgColor}`}>
      {/* Background Overlay */}
      <div className="cardBackground">
        <div className="overlay"></div>
      </div>

      {/* Card Content */}
      <div className="cardContent">
        {/* Top Right Arrow Button */}
        <Link href={link}>
          <button className="iconArrow">→</button>
        </Link>

        <h3 className="cardValue2">{title}</h3>
        <p className="cardValue">{value}</p>
        <div className="cardContentSection">
          <p className="cardDescription">{description}</p>

          {/* Promotion Button */}
          {promotion && <button className="promotion">{promotion}</button>}
        </div>

      </div>
    </div>
  );
}
