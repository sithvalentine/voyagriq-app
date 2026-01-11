# Clear localStorage for Testing

The CSV import fix is complete, but you may have corrupted data in your browser's localStorage from previous failed imports.

## Clear localStorage:

1. Open Chrome DevTools (F12 or right-click > Inspect)
2. Go to the **Application** tab
3. In the left sidebar, expand **Local Storage**
4. Click on `http://localhost:3000`
5. Find the key `trip_cost_insights_data`
6. Right-click and select **Delete**
7. Refresh the page

OR use the console:
```javascript
localStorage.removeItem('trip_cost_insights_data');
location.reload();
```

Then try importing your CSV file again. The new parser should work correctly.
