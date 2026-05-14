import { useState, useMemo } from 'react'
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'

export default function AgendamentosCalendar({ agendamentos }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  })

  const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 08:00 to 21:00

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7))
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7))

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
      {/* Header do Calendário */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-800 capitalize">
          {format(weekStart, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevWeek} className="p-2 hover:bg-white rounded-lg border border-gray-200 transition shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-white rounded-lg border border-gray-200 transition shadow-sm"
          >
            Hoje
          </button>
          <button onClick={nextWeek} className="p-2 hover:bg-white rounded-lg border border-gray-200 transition shadow-sm">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px] grid grid-cols-8 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="p-4 border-r border-gray-100 bg-gray-50/30"></div>
          {weekDays.map((day) => (
            <div key={day.toString()} className={`p-4 border-r border-gray-100 text-center ${isSameDay(day, new Date()) ? 'bg-indigo-50/30' : ''}`}>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                {format(day, 'eee', { locale: ptBR })}
              </p>
              <p className={`text-xl font-black ${isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-gray-700'}`}>
                {format(day, 'dd')}
              </p>
            </div>
          ))}
        </div>

        <div className="min-w-[800px] grid grid-cols-8 divide-x divide-gray-100">
          {/* Coluna de Horas */}
          <div className="flex flex-col bg-gray-50/10">
            {hours.map(hour => (
              <div key={hour} className="h-20 border-b border-gray-100 p-2 text-right">
                <span className="text-[10px] font-bold text-gray-400">{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Colunas de Dias */}
          {weekDays.map((day) => (
            <div key={day.toString()} className="relative flex flex-col group">
              {hours.map(hour => (
                <div key={hour} className="h-20 border-b border-gray-100 group-hover:bg-gray-50/30 transition-colors"></div>
              ))}
              
              {/* Agendamentos */}
              {agendamentos.filter(ag => isSameDay(parseISO(ag.data_hora), day)).map(ag => {
                const date = parseISO(ag.data_hora)
                const startHour = date.getHours()
                const startMinutes = date.getMinutes()
                
                // Só mostra se estiver no intervalo visível (8h-21h)
                if (startHour < 8 || startHour > 21) return null

                const topPos = (startHour - 8) * 80 + (startMinutes / 60) * 80
                
                return (
                  <div 
                    key={ag.id}
                    style={{ top: `${topPos}px`, height: '70px' }}
                    className={`absolute left-1 right-1 p-2 rounded-xl border-l-4 shadow-md z-0 transition-all hover:scale-[1.02] hover:z-20 cursor-pointer overflow-hidden ${
                      ag.status === 'confirmado' ? 'bg-green-50 border-green-500 text-green-800' :
                      ag.status === 'cancelado' ? 'bg-red-50 border-red-500 text-red-800' :
                      ag.status === 'concluido' ? 'bg-indigo-50 border-indigo-500 text-indigo-800' :
                      'bg-yellow-50 border-yellow-500 text-yellow-800'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <User size={10} className="opacity-50" />
                      <p className="text-[10px] font-bold truncate">Cliente #{ag.cliente_id}</p>
                    </div>
                    <p className="text-[9px] font-medium leading-tight opacity-80">{format(date, 'HH:mm')} - ID #{ag.servico_id}</p>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function parseISO(s) {
  return new Date(s)
}
