import Link from 'next/link';
import '../src/styles/dashboardCard2.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
type DashboardCard2Props = {
  title: string;
  description: string;
  link: string;
  bgColor: string;
  graphContent: React.ReactNode;
};

const DashboardCard2 = ({ title, description, link, bgColor, graphContent }: DashboardCard2Props) => {
  console.log(description)
  return (
    <div className={`card2 ${bgColor}`}>
      <div className="cardContent2">
      <div className="cardHeader8">
        <h3 className="cardTitle8">{title}</h3>
        <Link href={link}>
          <button className="iconArrow8"> <FontAwesomeIcon icon={faArrowRight} /></button>
        </Link>
      </div>
      <div className="graphSection2">
        {/* <p>{description}</p> */}
        <div className="graphShow">
        {graphContent} {/* Render the chart here */}

        </div>
      </div>
   
      </div>
     
    </div>
  );
};

export default DashboardCard2;
