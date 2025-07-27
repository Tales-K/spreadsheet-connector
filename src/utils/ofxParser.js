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
          fitid: transaction.FITID || '',
          checknum: transaction.CHECKNUM || '',
          refnum: transaction.REFNUM || ''
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
          fitid: transaction.FITID || '',
          checknum: transaction.CHECKNUM || '',
          refnum: transaction.REFNUM || ''
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
              fitid: transaction.FITID || '',
              checknum: transaction.CHECKNUM || '',
              refnum: transaction.REFNUM || ''
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
            console.log(`💳 Processing fallback CC transaction ${index + 1}:`, transaction);
            transactions.push({
              id: `${side}-row-${index}`,
              date: transaction.DTPOSTED || '',
              amount: transaction.TRNAMT || '',
              type: transaction.TRNTYPE || '',
              description: transaction.NAME || transaction.MEMO || '',
              fitid: transaction.FITID || '',
              checknum: transaction.CHECKNUM || '',
              refnum: transaction.REFNUM || ''
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

// Enhanced OFX parsing function that tries multiple methods
export const parseOfxFile = (ofxContent) => {
  console.log('🔨 Creating Ofx instance...');
  const ofx = new Ofx(ofxContent);
  console.log('✅ Ofx instance created successfully');
  
  // Try method 1: getBankTransferList
  try {
    console.log('🏦 Attempting to get bank transfer list...');
    const bankTransferList = ofx.getBankTransferList();
    console.log('✅ Bank transfer list retrieved:', bankTransferList);
    if (bankTransferList && bankTransferList.STRTTRN && bankTransferList.STRTTRN.length > 0) {
      return { bankTransferList };
    }
  } catch (bankError) {
    console.log('❌ Bank transfer list failed:', bankError.message);
  }
  
  // Try method 2: getCreditCardTransferList
  try {
    console.log('💳 Attempting to get credit card transfer list...');
    const creditCardTransferList = ofx.getCreditCardTransferList();
    console.log('✅ Credit card transfer list retrieved:', creditCardTransferList);
    if (creditCardTransferList && Array.isArray(creditCardTransferList) && creditCardTransferList.length > 0) {
      // The getCreditCardTransferList returns an array directly, so we need to wrap it properly
      return { creditCardTransferList: { STRTTRN: creditCardTransferList } };
    }
  } catch (creditError) {
    console.log('❌ Credit card transfer list failed:', creditError.message);
  }
  
  // Try method 3: getContent (raw OFX structure)
  try {
    console.log('📄 Attempting to get content...');
    const content = ofx.getContent();
    console.log('✅ Content retrieved:', content);
    if (content) {
      return content;
    }
  } catch (contentError) {
    console.log('❌ Get content failed:', contentError.message);
  }
  
  // Try method 4: toJson (full JSON response)
  try {
    console.log('🔄 Fallback to full JSON response...');
    const jsonResponse = ofx.toJson();
    console.log('✅ Full JSON response retrieved:', jsonResponse);
    return jsonResponse;
  } catch (jsonError) {
    console.log('❌ toJson failed:', jsonError.message);
    throw new Error('All OFX parsing methods failed');
  }
};
