import { Ofx } from "ofx-data-extractor";

// Helper function to convert OFX data to CSV-like format
export const convertOfxToCsv = (ofxResponse, side) => {
  console.log('🔄 convertOfxToCsv called with:', { ofxResponse, side });
  const transactions = [];
  
  try {
    // Handle bank transfer list - the API returns { STRTTRN: [...] }
    if (ofxResponse && ofxResponse.bankTransferList && ofxResponse.bankTransferList.STRTTRN) {
      console.log('🏦 Processing bank transfer list...');
      const bankTransactions = Array.isArray(ofxResponse.bankTransferList.STRTTRN) 
        ? ofxResponse.bankTransferList.STRTTRN 
        : [ofxResponse.bankTransferList.STRTTRN];
      
      console.log('🏦 Bank transactions found:', bankTransactions.length);
        
      bankTransactions.forEach((transaction, index) => {
        console.log(`🏦 Processing bank transaction ${index + 1}:`, transaction);
        transactions.push({
          id: `${side}-row-${index}`,
          date: transaction.DTPOSTED || '',
          amount: transaction.TRNAMT || '',
          type: transaction.TRNTYPE || '',
          description: transaction.NAME || transaction.MEMO || '',
          fitid: transaction.FITID || ''
        });
      });
    }
    
    // Handle credit card transfer list - similar structure
    if (ofxResponse && ofxResponse.creditCardTransferList && ofxResponse.creditCardTransferList.STRTTRN) {
      console.log('💳 Processing credit card transfer list...');
      const ccTransactions = Array.isArray(ofxResponse.creditCardTransferList.STRTTRN) 
        ? ofxResponse.creditCardTransferList.STRTTRN 
        : [ofxResponse.creditCardTransferList.STRTTRN];
      
      console.log('💳 Credit card transactions found:', ccTransactions.length);
        
      ccTransactions.forEach((transaction, index) => {
        console.log(`💳 Processing CC transaction ${index + 1}:`, transaction);
        transactions.push({
          id: `${side}-row-${index}`,
          date: transaction.DTPOSTED || '',
          amount: transaction.TRNAMT || '',
          type: transaction.TRNTYPE || '',
          description: transaction.NAME || transaction.MEMO || '',
          fitid: transaction.FITID || ''
        });
      });
    }
    
    // Fallback: Try to access from full JSON response
    if (transactions.length === 0 && ofxResponse) {
      console.log('🔄 No transactions found in specific lists, trying fallback...'); 
      console.log('🔍 Full OFX response structure:', JSON.stringify(ofxResponse, null, 2));
      
      // Check for full OFX structure from toJson() method
      if (ofxResponse.OFX && ofxResponse.OFX.BANKMSGSRSV1 && ofxResponse.OFX.BANKMSGSRSV1.STMTTRNRS) {
        console.log('🏦 Found BANKMSGSRSV1 structure');
        const stmtResponse = ofxResponse.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS;
        if (stmtResponse && stmtResponse.BANKTRANLIST && stmtResponse.BANKTRANLIST.STMTTRN) {
          const transactionList = Array.isArray(stmtResponse.BANKTRANLIST.STMTTRN) 
            ? stmtResponse.BANKTRANLIST.STMTTRN 
            : [stmtResponse.BANKTRANLIST.STMTTRN];
          
          console.log('🏦 Found bank transactions in fallback:', transactionList.length);
          transactionList.forEach((transaction, index) => {
            transactions.push({
              id: `${side}-row-${index}`,
              date: transaction.DTPOSTED || '',
              amount: transaction.TRNAMT || '',
              type: transaction.TRNTYPE || '',
              description: transaction.NAME || transaction.MEMO || '',
              fitid: transaction.FITID || ''
            });
          });
        }
      }
      
      // Check for credit card structure
      if (transactions.length === 0 && ofxResponse.OFX && ofxResponse.OFX.CREDITCARDMSGSRSV1) {
        console.log('💳 Found CREDITCARDMSGSRSV1 structure');
        const ccStmtResponse = ofxResponse.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS?.CCSTMTRS;
        if (ccStmtResponse && ccStmtResponse.BANKTRANLIST && ccStmtResponse.BANKTRANLIST.STMTTRN) {
          const transactionList = Array.isArray(ccStmtResponse.BANKTRANLIST.STMTTRN) 
            ? ccStmtResponse.BANKTRANLIST.STMTTRN 
            : [ccStmtResponse.BANKTRANLIST.STMTTRN];
          
          console.log('💳 Found CC transactions in fallback:', transactionList.length);
          transactionList.forEach((transaction, index) => {
            transactions.push({
              id: `${side}-row-${index}`,
              date: transaction.DTPOSTED || '',
              amount: transaction.TRNAMT || '',
              type: transaction.TRNTYPE || '',
              description: transaction.NAME || transaction.MEMO || '',
              fitid: transaction.FITID || ''
            });
          });
        }
      }
    }
    
    console.log(`✅ convertOfxToCsv completed with ${transactions.length} transactions`);
  } catch (error) {
    console.error('💥 Error converting OFX to CSV format:', error);
    console.error('Stack trace:', error.stack);
    throw new Error('Failed to convert OFX data to CSV format');
  }
  
  return transactions;
};

// Parse OFX file content and return structured data
export const parseOfxFile = (ofxContent) => {
  console.log('📖 FileReader loaded, content length:', ofxContent?.length);
  console.log('🔨 Creating Ofx instance...');
  const ofx = new Ofx(ofxContent);
  console.log('✅ Ofx instance created successfully');
  
  // Get bank transfer list or credit card transfer list
  let parsedOfx;
  try {
    console.log('🏦 Attempting to get bank transfer list...');
    const bankTransferList = ofx.getBankTransferList();
    console.log('✅ Bank transfer list retrieved:', bankTransferList);
    parsedOfx = { bankTransferList };
  } catch (bankError) {
    console.log('❌ Bank transfer list failed:', bankError.message);
    try {
      console.log('💳 Attempting to get credit card transfer list...');
      const creditCardTransferList = ofx.getCreditCardTransferList();
      console.log('✅ Credit card transfer list retrieved:', creditCardTransferList);
      parsedOfx = { creditCardTransferList };
    } catch (creditError) {
      console.log('❌ Credit card transfer list failed:', creditError.message);
      console.log('🔄 Fallback to full JSON response...');
      parsedOfx = ofx.toJson();
      console.log('✅ Full JSON response retrieved:', parsedOfx);
    }
  }
  
  return parsedOfx;
};
