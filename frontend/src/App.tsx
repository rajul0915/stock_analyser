import { useEffect, useState } from 'react';

function App() {
  // Stock search state
  const [stockQuery, setStockQuery] = useState('');
  const [stockResult, setStockResult] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState('');

  // Portfolio state
  type PortfolioStock = {
    stockName: string;
    symbol: string;
    quantity: number;
    buyPrice: number;
    buyDate: string;
    notes?: string;
  };
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([]);
  const [handleSubmitTimestamp, setHandleSubmitTimestamp] = useState<number | null>(null);
  const [portfolioInput, setPortfolioInput] = useState<PortfolioStock>({
    stockName: '',
    symbol: '',
    quantity: 0,
    buyPrice: 0,
    buyDate: '',
    notes: '',
  });

  // Fetch portfolio on mount
  useEffect(() => {
    fetch('http://localhost:3000/api/portfolio')
      .then(res => res.json())
      .then(setPortfolio)
      .catch(console.error);
  }, [handleSubmitTimestamp]);

  // Add stock to portfolio
  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolioInput)
      });
      if (res.ok) {
        const newStock = await res.json();
        setPortfolio(prev => [...prev, newStock]);
        setPortfolioInput({ stockName: '', symbol: '', quantity: 0, buyPrice: 0, buyDate: '', notes: '' });
        setHandleSubmitTimestamp(Date.now()); // Update timestamp to trigger re-render
      } else {
        console.error('Failed to add stock');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stock search handler
  const handleStockSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setStockLoading(true);
    setStockError('');
    setStockResult(null);
    try {
      const res = await fetch(`https://stock.indianapi.in/stock?name=${encodeURIComponent(stockQuery)}`, {
        headers: { 'x-api-key': 'sk-live-0mcvnVj1yDwdHoXWGSwdTR5KOgaYDKzntFIrjMwW' }
      });
      if (!res.ok) throw new Error('Stock not found');
      const data = await res.json();
      // Log the full response to the console for developer inspection
      console.log('Full Stock API Response:', data);
      // Extract and display only the most important fields for the UI
      const importantFields = {
        companyName: data.companyName,
        industry: data.industry,
        percentChange: data.percentChange,
        currentPrice: data.currentPrice,
        yearHigh: data.yearHigh,
        yearLow: data.yearLow,
        stockTechnicalData: data.stockTechnicalData,
        financials: data.financials,
        companyProfile: {
          exchangeCodeNse: data.companyProfile?.exchangeCodeNse,
          isInId: data.companyProfile?.isInId,
          peerCompanyList: data.companyProfile?.peerCompanyList,
          officers: data.companyProfile?.officers?.officer || [],
          companyDescription: data.companyProfile?.companyDescription || '',
        },
      };
      setStockResult(importantFields);
    } catch (err: any) {
      setStockError(err.message || 'Error fetching stock');
    } finally {
      setStockLoading(false);
    }
  };

  // Helper to render officers
  const renderOfficers = (officersArr: any[]) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
      <thead>
        <tr style={{ background: '#f5f5f5' }}>
          <th style={cellStyle}>Name</th>
          <th style={cellStyle}>Title</th>
          <th style={cellStyle}>Since</th>
          <th style={cellStyle}>Age</th>
        </tr>
      </thead>
      <tbody>
        {officersArr.map((o, i) => (
          <tr key={i}>
            <td style={cellStyle}>{[o.firstName, o.mI, o.lastName].filter(Boolean).join(' ')}</td>
            <td style={cellStyle}>{o.title?.Value}</td>
            <td style={cellStyle}>{o.since}</td>
            <td style={cellStyle}>{o.age ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Helper to render peer companies
  const renderPeers = (peers: any[]) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
      <thead>
        <tr style={{ background: '#f5f5f5' }}>
          <th style={cellStyle}>Name</th>
          <th style={cellStyle}>Price</th>
          <th style={cellStyle}>Market Cap</th>
          <th style={cellStyle}>Rating</th>
        </tr>
      </thead>
      <tbody>
        {peers.map((p, i) => (
          <tr key={i}>
            <td style={cellStyle}>{p.companyName}</td>
            <td style={cellStyle}>{p.price}</td>
            <td style={cellStyle}>{p.marketCap}</td>
            <td style={cellStyle}>{p.overallRating}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Helper to render technical data
  const renderTechnical = (techArr: any[]) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
      <thead>
        <tr style={{ background: '#f5f5f5' }}>
          <th style={cellStyle}>Days</th>
          <th style={cellStyle}>NSE Price</th>
        </tr>
      </thead>
      <tbody>
        {techArr.map((t, i) => (
          <tr key={i}>
            <td style={cellStyle}>{t.days}</td>
            <td style={cellStyle}>{t.nsePrice}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Helper to render financials
  const renderFinancials = (fin: any) => {
    if (!fin) return null;
    const cas: any[] = fin.CAS || [];
    const bal: any[] = fin.BAL || [];
    return (
      <div>
        <h4 style={{margin: '12px 0 4px'}}>Key Financials</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={cellStyle}>Metric</th>
              <th style={cellStyle}>Value</th>
            </tr>
          </thead>
          <tbody>
            {cas.filter((f: any) => [
              'NetIncome/StartingLine',
              'CashfromOperatingActivities',
              'CashfromFinancingActivities',
              'NetChangeinCash',
            ].includes(f.key)).map((f: any, i: number) => (
              <tr key={i}><td style={cellStyle}>{f.displayName}</td><td style={cellStyle}>{f.value}</td></tr>
            ))}
            {bal.filter((f: any) => [
              'TotalCurrentAssets',
              'TotalReceivablesNet',
              'CashEquivalents',
              'ShortTermInvestments',
            ].includes(f.key)).map((f: any, i: number) => (
              <tr key={i}><td style={cellStyle}>{f.displayName}</td><td style={cellStyle}>{f.value}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', padding: '2rem', background: '#f6f8fa', minHeight: '100vh' }}>
      {/* Left: Stock Detail Section */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
          <h2 style={{ marginBottom: 16 }}>Stock Search</h2>
          <form onSubmit={handleStockSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Enter stock name or symbol"
              value={stockQuery}
              onChange={e => setStockQuery(e.target.value)}
              style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
              required
            />
            <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, background: '#646cff', color: '#fff', border: 'none', fontWeight: 500 }}>Search</button>
          </form>
          {stockLoading && <div>Loading...</div>}
          {stockError && <div style={{ color: 'red' }}>{stockError}</div>}
          {stockResult && (
            <div style={{background:'#fafbff',padding:16,borderRadius:8,marginTop:12}}>
              <h3 style={{marginTop:0}}>{stockResult.companyName}</h3>
              <div style={{marginBottom:8}}><b>Industry:</b> {stockResult.industry}</div>
              <div style={{marginBottom:8}}><b>Description:</b> {stockResult.companyProfile?.companyDescription}</div>
              <div style={{marginBottom:8}}><b>NSE Code:</b> {stockResult.companyProfile?.exchangeCodeNse} &nbsp; <b>ISIN:</b> {stockResult.companyProfile?.isInId}</div>
              <div style={{marginBottom:8}}>
                <b>Current Price (NSE):</b> {stockResult.currentPrice?.NSE ?? '-'} &nbsp; <b>BSE:</b> {stockResult.currentPrice?.BSE ?? '-'}
                &nbsp; <b>Change:</b> {stockResult.percentChange}%
              </div>
              <div style={{marginBottom:8}}><b>Year High:</b> {stockResult.yearHigh} &nbsp; <b>Year Low:</b> {stockResult.yearLow}</div>
              {stockResult.companyProfile?.peerCompanyList && (
                <div style={{marginTop:16}}>
                  <h4 style={{margin:'12px 0 4px'}}>Peer Companies</h4>
                  {renderPeers(stockResult.companyProfile.peerCompanyList)}
                </div>
              )}
              {stockResult.stockTechnicalData && (
                <div style={{marginTop:16}}>
                  <h4 style={{margin:'12px 0 4px'}}>Technical Data</h4>
                  {renderTechnical(stockResult.stockTechnicalData)}
                </div>
              )}
              {stockResult.financials && stockResult.financials[0]?.stockFinancialMap && (
                <div style={{marginTop:16}}>
                  {renderFinancials(stockResult.financials[0].stockFinancialMap)}
                </div>
              )}
              {stockResult.companyProfile?.officers?.officer && (
                <div style={{marginTop:16}}>
                  <h4 style={{margin:'12px 0 4px'}}>Key Officers</h4>
                  {renderOfficers(stockResult.companyProfile.officers.officer)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Right: Portfolio Section */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
          <h2 style={{ marginBottom: 16 }}>Add Stock to Portfolio</h2>
          <form onSubmit={handlePortfolioSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Stock Name"
              value={portfolioInput.stockName}
              onChange={e => setPortfolioInput({ ...portfolioInput, stockName: e.target.value })}
              required
              style={{ flex: 1, minWidth: 120, padding: 8 }}
            />
            <input
              type="text"
              placeholder="Symbol"
              value={portfolioInput.symbol}
              onChange={e => setPortfolioInput({ ...portfolioInput, symbol: e.target.value })}
              required
              style={{ flex: 1, minWidth: 80, padding: 8 }}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={portfolioInput.quantity || ''}
              onChange={e => setPortfolioInput({ ...portfolioInput, quantity: Number(e.target.value) })}
              required
              min={1}
              style={{ flex: 1, minWidth: 80, padding: 8 }}
            />
            <input
              type="number"
              placeholder="Buy Price"
              value={portfolioInput.buyPrice || ''}
              onChange={e => setPortfolioInput({ ...portfolioInput, buyPrice: Number(e.target.value) })}
              required
              min={0}
              step={0.01}
              style={{ flex: 1, minWidth: 100, padding: 8 }}
            />
            <input
              type="date"
              value={portfolioInput.buyDate}
              onChange={e => setPortfolioInput({ ...portfolioInput, buyDate: e.target.value })}
              required
              style={{ flex: 1, minWidth: 120, padding: 8 }}
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={portfolioInput.notes}
              onChange={e => setPortfolioInput({ ...portfolioInput, notes: e.target.value })}
              style={{ flex: 2, minWidth: 150, padding: 8 }}
            />
            <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, background: '#646cff', color: '#fff', border: 'none', fontWeight: 500 }}>Add to Portfolio</button>
          </form>
        </div>
        {/* Portfolio Table below the form */}
        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
          <h3 style={{ margin: '0 0 8px' }}>My Portfolio</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={cellStyle}>Stock Name</th>
                <th style={cellStyle}>Symbol</th>
                <th style={cellStyle}>Quantity</th>
                <th style={cellStyle}>Buy Price</th>
                <th style={cellStyle}>Buy Date</th>
                <th style={cellStyle}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((stock, i) => (
                <tr key={i}>
                  <td style={cellStyle}>{stock.stockName}</td>
                  <td style={cellStyle}>{stock.symbol}</td>
                  <td style={cellStyle}>{stock.quantity}</td>
                  <td style={cellStyle}>{stock.buyPrice}</td>
                  <td style={cellStyle}>{new Date(stock.buyDate).toLocaleDateString()}</td>
                  <td style={cellStyle}>{stock.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// CSS for stock table cells
const cellStyle = {
  padding: '8px 12px',
  border: '1px solid #ddd',
  background: '#fafafa',
  fontSize: 15,
  fontWeight: 400,
};

export default App;
