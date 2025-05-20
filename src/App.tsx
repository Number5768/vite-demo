import React from 'react'
import './App.css'

function App() {
    const apiKey = 'AIzaSyC-jIstum8gAzi_S8evq8PJpjSddjoG1JM'
    const sheetId = '1a7u0vd2Fcj7X85bdNX_DaQxECeL55NUyLsp370G7A1c'
    const range = 'Sheet1'

    const [data, setData] = React.useState<string[][]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [searchTerm, setSearchTerm] = React.useState('')

    React.useEffect(() => {
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                return response.json()
            })
            .then((data) => {
                setData(data.values)
                setLoading(false)
            })
            .catch((error) => {
                setError(error.message)
                setLoading(false)
            })
    }, [apiKey, sheetId, range])

    const filteredData = React.useMemo(() => {
        if (!data || data.length <= 1) return []

        return data.slice(1).filter(row => {
            return row.some(cell =>
                cell.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })
    }, [data, searchTerm])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>กำลังโหลดข้อมูล...</p>
        </div>
    )

    if (error) return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>เกิดข้อผิดพลาด</h3>
            <p>{error}</p>
        </div>
    )

    if (!data || data.length === 0) return (
        <div className="no-data-container">
            <div className="no-data-icon">📭</div>
            <p>ไม่พบข้อมูล</p>
        </div>
    )

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>ข้อมูล Google Sheet</h1>
                <p className="subtitle">แสดงข้อมูลจาก Google Spreadsheet</p>
            </header>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="ค้นหาข้อมูล..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                />
                <div className="search-icon">🔍</div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {data[0]?.map((header: string, index: number) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredData.length === 0 && searchTerm && (
                    <div className="no-results">
                        <p>ไม่พบข้อมูลที่ตรงกับ "{searchTerm}"</p>
                    </div>
                )}
            </div>

            <footer className="app-footer">
                <p>© {new Date().getFullYear()} ข้อมูลจาก Google Sheets API</p>
            </footer>
        </div>
    )
}

export default App