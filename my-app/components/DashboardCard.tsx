import Link from 'next/link';
import '../src/styles/dashboardCard.css';

type DashboardCardProps = {
  title: string;
  value: string | number;
  description: string;
  link: string;
  bgColor: string;
  promotion: string;
};

export default function DashboardCard({ title, value, description, link, bgColor, promotion }: DashboardCardProps) {
  return (
    <div className={`card compare ${bgColor}`}> 
      {/* Using 'compare' class from CSS */}
      <div className="cardBackground">
        <div className="overlay"></div>
      </div>
      <div className="cardContent">
        <h3 className="cardTitle">{title}</h3>
        <p className="cardValue">{value}</p>
        <p className="cardDescription">{description}</p>
        <button className="promotion">{promotion}</button>
        <Link href={link}>
          <button className="iconArrow">→</button>
        </Link>
      </div>
    </div>
  );
}
