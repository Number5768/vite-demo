import React from 'react'
import CryptoJS from 'crypto-js'
import './App.css'

const apiKey = 'AIzaSyC-jIstum8gAzi_S8evq8PJpjSddjoG1JM'
const sheetId = '1a7u0vd2Fcj7X85bdNX_DaQxECeL55NUyLsp370G7A1c'

export function generateHMAC(ptValue: string, ptKey = '') {
    const key = CryptoJS.enc.Utf8.parse(ptKey)
    const message = CryptoJS.enc.Utf8.parse(ptValue)
    const hmac = CryptoJS.HmacSHA256(message, key)
    return hmac.toString(CryptoJS.enc.Base64).toLowerCase()
}

export function verifyHMAC(ptValue: string, ptHmacToVerify: string, ptKey = '') {
    const computedHmac = generateHMAC(ptValue, ptKey)
    return computedHmac === ptHmacToVerify.trim().toLowerCase()
}

function App() {

    const [data, setData] = React.useState<string[][]>([])
    const [data2, setData2] = React.useState<string[][]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [searchTerm, setSearchTerm] = React.useState('')
    const [reloading, setReloading] = React.useState(false)

    const fetchData = React.useCallback(async () => {
        // setLoading(true)
        // setError(null)

        const sheet1 = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`)
        if (!sheet1.ok) {
            setLoading(false)
            setError('ไม่สามารถโหลดข้อมูลได้')
            return
        }

        const result = await sheet1.json()
        if (result.values) {
            setData(result.values)
            setLoading(false)
            setReloading(false)
        }

        if (!result.values || result.values.length === 0) {
            setLoading(false)
            setError('ไม่พบข้อมูลใน Google Sheet')
            return
        }

        // const sheet2 = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet2!F10:K?key=${apiKey}`)
        const sheet2 = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet2!F10:K23?key=${apiKey}`)
        if (!sheet2.ok) {
            setLoading(false)
            setError('ไม่สามารถโหลดข้อมูลได้')
            return
        }
        const result2 = await sheet2.json()
        if (result2.values) {
            setData2(result2.values)
        }
    }, [apiKey, sheetId])

    React.useEffect(() => {
        const interval = setInterval(() => {
            fetchData()
        }, 7000)
        return () => clearInterval(interval)
    }, [fetchData])

    const filteredData = React.useMemo(() => {
        if (!data || data.length <= 1) return []
        return data.slice(1).filter(row => {
            return row.some(cell => cell.toLowerCase().includes(searchTerm.toLowerCase()))
        })
    }, [data, searchTerm])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const handleReload = () => {
        console.log('HMAC', generateHMAC('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3NDc3NGNkNy1iYzNhLTQ4OGMtYWE1NC1lZGJkOTUyZDhhZGQiLCJhdWQiOiJMSU5FIiwiaWF0IjoxNzQ4MDU0NzQ0LCJleHAiOjE3NDg2NTk1NDQsInNjcCI6IkxJTkVfQ09SRSIsInJ0aWQiOiI4MDA3NmQ5NC0wYzQ0LTQzOTUtYTBhZC1kYTAxMTNmYWIyYWQiLCJyZXhwIjoxNzc5NTkwNzQ0LCJ2ZXIiOiIzLjEiLCJhaWQiOiJ1ZmQwOWZkM2FjNTAxZmY4YjA0NThhYTQ4ODMyNDIyMGMiLCJsc2lkIjoiYzhiMDRlZjYtY2NhZC00YmI4LWExZGUtNmE2NGUzNzY4OWRhIiwiZGlkIjoiTk9ORSIsImN0eXBlIjoiQ0hST01FT1MiLCJjbW9kZSI6IlNFQ09OREFSWSIsImNpZCI6IjAzMDAwMDAwMDAifQ.kCv7coZo4muPeV-NFM0TYpTNhKbIPoYpOwP1KSoTQo0', 'UhtGarPE25BUuiorh3UnzO1ATI6kNy1PJIhciE587DBg'))
        setReloading(true)
        fetchData()
    }

    if (loading && !reloading) return (
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
                <div className="search-and-reload">
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="ค้นหาข้อมูล..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                        <div className="search-icon">🔍</div>
                    </div>
                    <button
                        className={`reload-button ${reloading ? 'reloading' : ''}`}
                        onClick={handleReload}
                        disabled={reloading}
                    >
                        <span className="reload-icon">🔄</span>
                        <span className="reload-text">รีโหลดข้อมูล</span>
                    </button>
                </div>
                {reloading && (
                    <div className="reloading-indicator">
                        <div className="mini-spinner"></div>
                        <span>กำลังโหลดข้อมูลใหม่...</span>
                    </div>
                )}
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ลำดับ</th>
                            {data[0]?.flatMap((header: string, index: number) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData?.flatMap((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}>
                                <td>{rowIndex + 1}</td>
                                {row.flatMap((cell, cellIndex) => (
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

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {data2[0]?.flatMap((header: string, index: number) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data2?.slice(1).flatMap((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}>
                                {row.flatMap((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="app-footer">
                <p>© {new Date().getFullYear()} ข้อมูลจาก Google Sheets API</p>
            </footer>
        </div>
    )
}

export default App