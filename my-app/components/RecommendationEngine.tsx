interface Product {
  sellingprice: number;
  ReliabilityScore: number;
}

interface RecommendationEngineProps {
  targetProduct: Product;
  competitorProducts: Product[];
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ targetProduct, competitorProducts }) => {
    const recommendations = [];
  
    // Suggest increasing selling price if competitors have higher prices
    const avgCompetitorPrice = competitorProducts.reduce((sum, p) => sum + p.sellingprice, 0) / competitorProducts.length;
    if (targetProduct.sellingprice < avgCompetitorPrice) {
      recommendations.push("Increase the selling price to match competitors.");
    }
  
    // Suggest reducing delivery time if reliability is lower
    const avgCompetitorReliability = competitorProducts.reduce((sum, p) => sum + p.ReliabilityScore, 0) / competitorProducts.length;
    if (targetProduct.ReliabilityScore < avgCompetitorReliability) {
      recommendations.push("Reduce delivery time to improve vendor reliability.");
    }
  
    return (
      <div className="recommendations-container">
        <h3>Recommendations</h3>
        {recommendations.length > 0 ? (
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        ) : (
          <p>No recommendations available.</p>
        )}
      </div>
    );
  };
  export default RecommendationEngine; // Add export statement