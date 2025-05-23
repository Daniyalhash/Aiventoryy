import Link from 'next/link';
import '../src/styles/customCard.css';

type DashboardCard3Props = {
  title: string;
  value: string | number;
  description: string;
  link: string;
  bgColor?: string;
  promotion?: string;
  as?: any;
  href?: string;
  arrow?: 'right' | 'left';
  children?: React.ReactNode;
};

export default function DashboardCard3({ 
  title, 
  value, 
  description, 
  link, 
  bgColor, 
  promotion,
  as: Component = 'div',
  href,
  arrow,
  children 
}: DashboardCard3Props) {
  console.log(href)
  console.log(arrow)
    console.log(children)

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
