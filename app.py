from flask import Flask, request, jsonify, render_template
from tradingview_ta import TA_Handler, Interval
import logging

app = Flask(__name__, template_folder='templates', static_folder='static')

logging.basicConfig(level=logging.DEBUG)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_stock_data', methods=['POST'])
def get_stock_data():
    try:
        data = request.get_json()
        ticker = data.get('ticker')
        
        if not ticker:
            raise ValueError("Ticker is required")
        
        handler = TA_Handler(
            symbol=ticker,
            screener="india",  # Screener for Indian market
            exchange="NSE",    # Exchange set to NSE
            interval=Interval.INTERVAL_1_DAY
        )
        analysis = handler.get_analysis()

        current_price = analysis.indicators.get('close')
        open_price = analysis.indicators.get('open')
        recommendation = analysis.summary.get('RECOMMENDATION')

        # Log the retrieved data
        app.logger.debug(f"Ticker: {ticker}, Current Price: {current_price}, Open Price: {open_price}, Recommendation: {recommendation}")

        return jsonify({
            'currentPrice': current_price,
            'openPrice': open_price,
            'recommendation': recommendation,
            'history': handler.get_indicators().get('history', [])
        })
    
    except ValueError as e:
        app.logger.error(f'ValueError: {str(e)}')
        return jsonify({'error': str(e)}), 400
    
    except KeyError as e:
        app.logger.error(f'KeyError: {str(e)}')
        return jsonify({'error': f'Invalid ticker symbol: {str(e)}'}), 400
    
    except Exception as e:
        app.logger.error(f'Exception: {str(e)}')
        return jsonify({'error': 'Failed to fetch stock data. Please try again later.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
