import '../src/styles/customCard2.css';

type DashboardCard5Props = {
  main: string;
  subTitle?: string;
  value?: string | number;
  value2?: string | number;
  guidance?: string;
  description?: string;
  description2?: string;
  percentage?: string | number;
  bgColor?: string;
  children?: React.ReactNode; // ✅ Add this line
};
export default function DashboardCard5({
  main,
  subTitle,
  value,
  value2,
  guidance,
  description,
  description2,
  percentage,
  bgColor,
}: DashboardCard5Props) {
  console.log(description)
  console.log(description2)
  console.log(value2)
  return (
    <div className={`cardC5 compare2 ${bgColor}`}>
      {/* Background Overlay */}
      <div className="cardBackground">
        <div className="overlay"></div>
      </div>

      {/* Card Content */}
      <div className="cardContent5">
        {/* Top Right Arrow Button */}
        
        <h2 className="subTitle2">{main}</h2>
        <h2 className="subTitle">{subTitle}</h2>
        <p className="cardValue3">{guidance}</p>

        <div className="cardMain">
        <div className="value-container">
            <p className="cardValue">{value}</p>
            {percentage && (
              <span className="percentage-indicator">{percentage}</span>
            )}
          </div>
          <p className="guidance">{guidance}</p>
          <p className="cardDescription">{description}</p>
        <p className="cardDescription2">{description2}</p>
        
        </div>
       
        
        {/* Promotion Button */}
      </div>
      
    </div>
  );
}
