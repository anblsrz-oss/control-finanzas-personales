// Diccionario inglés. Las claves son el texto en español (claves naturales);
// si una clave no está aquí, i18next cae al español (fallbackLng: 'es').
// Interpolaciones con {{var}} se conservan igual en ambos idiomas.

export const en: Record<string, string> = {
  // Navegación
  Resumen: 'Summary',
  Cuentas: 'Accounts',
  Tarjetas: 'Cards',
  Transacciones: 'Transactions',
  'Movs.': 'Txns',
  Importar: 'Import',
  'Escanear recibo': 'Scan receipt',
  Recibos: 'Receipts',
  Familia: 'Family',
  'Sincronizar correo': 'Sync email',
  Correo: 'Email',
  'Sincronizar SMS': 'Sync SMS',
  SMS: 'SMS',
  'Conexión automática': 'Auto connection',
  Conectar: 'Connect',
  Categorías: 'Categories',
  Presupuestos: 'Budgets',
  'Presup.': 'Budgets',
  Rendimientos: 'Yields',
  'Rendim.': 'Yields',
  Reportes: 'Reports',
  Configuración: 'Settings',
  Ajustes: 'Settings',
  Admin: 'Admin',
  Más: 'More',
  'Más opciones': 'More options',
  Usuario: 'User',

  // Común
  Cancelar: 'Cancel',
  Crear: 'Create',
  Editar: 'Edit',
  Eliminar: 'Delete',
  'Guardando…': 'Saving…',
  'Eliminando…': 'Deleting…',
  'Cargando…': 'Loading…',
  Aceptar: 'Accept',
  Rechazar: 'Decline',
  Invitar: 'Invite',
  'Cargando usuarios...': 'Loading users...',
  'Error:': 'Error:',
  'Error desconocido': 'Unknown error',
  'No hay sesión activa': 'No active session',
  Tipo: 'Type',
  Monto: 'Amount',
  Moneda: 'Currency',
  Fecha: 'Date',
  Concepto: 'Concept',
  Categoría: 'Category',
  'Sin categoría': 'No category',
  'Sin concepto': 'No concept',
  Cuenta: 'Account',
  'O tarjeta': 'Or card',
  'Selecciona una cuenta': 'Select an account',
  'Selecciona una tarjeta': 'Select a card',
  Ingreso: 'Income',
  Egreso: 'Expense',
  Verificado: 'Verified',
  'Sin banco': 'No bank',
  'Sin marca': 'No brand',

  // Login
  'Organiza tus ingresos, gastos y cuentas en un solo lugar.':
    'Organize your income, expenses and accounts in one place.',
  'Continuar con Google': 'Continue with Google',
  'Al continuar aceptas nuestros': 'By continuing you accept our',
  'y nuestra': 'and our',

  // Dashboard / Reportes
  'Vista general de tus ingresos, egresos y balance.':
    'Overview of your income, expenses and balance.',
  'Total Ingresos': 'Total Income',
  'Total Egresos': 'Total Expenses',
  Balance: 'Balance',
  'Ingresos vs Egresos': 'Income vs Expenses',
  'Gastos por Categoría': 'Expenses by Category',
  'Sin transacciones este mes.': 'No transactions this month.',
  'Sin transacciones en este período.': 'No transactions in this period.',
  'Gráficas de ingresos y gastos por período, cuenta y tarjeta.':
    'Income and expense charts by period, account and card.',
  'Rango de fechas': 'Date range',
  Desde: 'From',
  Hasta: 'To',
  'Premium: filtra por rango de fechas personalizado, cuenta o tarjeta. Actualiza tu plan para más análisis.':
    'Premium: filter by custom date range, account or card. Upgrade your plan for more analytics.',
  'Ingresos y Egresos por Tarjeta': 'Income and Expenses by Card',
  'Ingresos y Egresos por Cuenta': 'Income and Expenses by Account',
  'Uso de línea de crédito': 'Credit line usage',
  'Sin líneas de crédito registradas.': 'No credit lines registered.',
  'Sin movimientos en este período.': 'No activity in this period.',
  'Sin asignar': 'Unassigned',
  'Sin gastos en este período': 'No expenses in this period',
  // Configuración de gráficos
  'Configurar gráfico': 'Configure chart',
  'Restablecer colores': 'Reset colors',
  'Incluir en Excel': 'Include in Excel',
  'Cambiar color': 'Change color',
  Subir: 'Move up',
  Bajar: 'Move down',
  Mostrar: 'Show',
  Series: 'Series',
  Elementos: 'Items',
  Listo: 'Done',
  Gasto: 'Spending',
  'Uso bajo': 'Low usage',
  'Uso medio': 'Medium usage',
  'Uso alto': 'High usage',

  // Transacciones
  'Ingresos, egresos y transferencias entre tus cuentas.':
    'Income, expenses and transfers between your accounts.',
  'Ocultar historial': 'Hide history',
  'Historial ({{count}})': 'History ({{count}})',
  '+ Nueva transacción': '+ New transaction',
  'Historial de transacciones eliminadas': 'Deleted transactions history',
  Filtros: 'Filters',
  'Limpiar filtros': 'Clear filters',
  '{{count}} transacciones': '{{count}} transactions',
  'Ninguna transacción coincide con los filtros.':
    'No transactions match the filters.',
  Buscar: 'Search',
  'Concepto o nota…': 'Concept or note…',
  Todos: 'All',
  Todas: 'All',
  Pendientes: 'Pending',
  Conciliadas: 'Settled',
  Transferencia: 'Transfer',
  'Monto mín.': 'Min amount',
  'Monto máx.': 'Max amount',
  'Sin opciones': 'No options',
  'Aún no has eliminado ninguna.': "You haven't deleted any yet.",
  eliminada: 'deleted',
  'Motivo:': 'Reason:',
  'Sin transacciones. Registra una para empezar.':
    'No transactions. Add one to get started.',
  Pendiente: 'Pending',
  'Eliminar transacción': 'Delete transaction',
  'Vas a eliminar': 'You are about to delete',
  por: 'for',
  'El balance de tus cuentas se ajustará automáticamente.':
    'Your account balances will adjust automatically.',
  'Motivo de la eliminación': 'Reason for deletion',
  'Ej. Registrada por error, duplicada, monto incorrecto…':
    'E.g. Recorded by mistake, duplicated, wrong amount…',
  'Escribe el motivo de la eliminación.': 'Write the reason for deletion.',

  // TransactionForm
  '📥 Ingreso': '📥 Income',
  '📤 Egreso': '📤 Expense',
  '🔄 Transferencia': '🔄 Transfer',
  'Ej: Almuerzo': 'E.g. Lunch',
  'Cuenta destino': 'Destination account',
  Requerida: 'Required',
  'Cuenta origen': 'Source account',
  'Selecciona origen': 'Select source',
  'Selecciona destino': 'Select destination',
  'Selecciona la cuenta destino': 'Select the destination account',
  'Selecciona una cuenta o tarjeta': 'Select an account or card',
  'Selecciona cuenta origen y destino': 'Select source and destination accounts',
  'Las cuentas no pueden ser la misma': 'The accounts cannot be the same',
  Compra: 'Purchase',
  Familiar: 'Family',
  'Este gasto se registrará en el plan familiar, no en tus finanzas personales.':
    'This expense will be recorded in the family plan, not in your personal finances.',
  'Gasto familiar (se registra en el plan familiar)':
    'Family expense (recorded in the family plan)',
  'Meses sin intereses / Diferido': 'Interest-free months / Deferred',
  Meses: 'Months',
  'Interés ($)': 'Interest ($)',
  'Notas (opcional)': 'Notes (optional)',
  'Detalles adicionales...': 'Additional details...',
  Registrar: 'Save',

  // Recibos
  'Toma una foto del ticket y registra el gasto automáticamente':
    'Take a photo of the receipt and record the expense automatically',
  'Fotografía el ticket con buena luz y lo más plano posible. Después podrás revisar y corregir los datos detectados.':
    'Photograph the receipt with good light and as flat as possible. Then you can review and correct the detected data.',
  'Tomar foto': 'Take photo',
  'o subir una imagen existente': 'or upload an existing image',
  'Leyendo el ticket…': 'Reading the receipt…',
  'Revisa y corrige los datos': 'Review and correct the data',
  'Concepto / comercio': 'Concept / merchant',
  'Ej: Supermercado': 'E.g. Supermarket',
  'Registrar gasto': 'Save expense',
  'Ocultar texto detectado': 'Hide detected text',
  'Ver texto detectado': 'See detected text',
  '(sin texto)': '(no text)',
  'Gasto registrado correctamente.': 'Expense recorded successfully.',
  'Escanear otro': 'Scan another',
  'Ver movimientos': 'See transactions',
  'error desconocido': 'unknown error',
  'Este recibo ya fue registrado (movimiento duplicado).':
    'This receipt was already recorded (duplicate transaction).',
  'No se pudo leer el ticket: {{error}}. Revisa tu conexión (la primera vez se descarga el motor OCR) e intenta de nuevo.':
    'Could not read the receipt: {{error}}. Check your connection (the OCR engine is downloaded the first time) and try again.',

  // Familia
  'Comparte tarjetas con tu familia y lleven los gastos juntos':
    'Share cards with your family and track expenses together',
  'Te invitaron a la familia': 'You were invited to the family',
  'Sin nombre': 'No name',
  'Crear plan familiar': 'Create family plan',
  'Como jefe de familia podrás invitar a tus familiares por correo y compartirles tus tarjetas de crédito. Ellos registran sus gastos y tú mantienes el control: solo tú ves el límite de tus tarjetas.':
    'As family head you can invite your relatives by email and share your credit cards with them. They record their expenses and you stay in control: only you see your cards’ limits.',
  'Nombre de la familia': 'Family name',
  'Función Premium': 'Premium feature',
  'El plan familiar permite al jefe de familia compartir tarjetas con sus familiares y llevar los gastos del hogar por separado. Hazte Premium para crear tu familia. (Ser miembro invitado no requiere Premium.)':
    'The family plan lets the family head share cards with relatives and track household expenses separately. Go Premium to create your family. (Being an invited member does not require Premium.)',
  miembros: 'members',
  'Salir de la familia': 'Leave the family',
  '¿Salir de la familia? Tus gastos familiares pasados seguirán en el historial de la familia.':
    'Leave the family? Your past family expenses will remain in the family history.',
  'Ese correo ya fue invitado.': 'That email was already invited.',
  '¿Quitar a {{name}}? Sus gastos familiares pasados se conservan en el historial.':
    'Remove {{name}}? Their past family expenses are kept in the history.',
  'Aún no hay miembros.': 'No members yet.',
  'Invita a alguien con su correo.': 'Invite someone with their email.',
  'Tarjetas compartidas': 'Shared cards',
  'No tienes tarjetas de crédito registradas. Crea una en Tarjetas para poder compartirla.':
    "You have no credit cards registered. Create one in Cards to share it.",
  'Gasto familiar:': 'Family spend:',
  'Disponible total:': 'Total available:',
  'Dejar de compartir': 'Stop sharing',
  Compartir: 'Share',
  'El jefe de familia aún no comparte tarjetas.':
    "The family head hasn't shared cards yet.",
  'Gasto familiar acumulado:': 'Accumulated family spend:',
  'Registra gastos con estas tarjetas desde Transacciones eligiendo la tarjeta marcada como familiar.':
    'Record expenses with these cards from Transactions by choosing the card marked as family.',
  'Movimientos familiares': 'Family transactions',
  'Todavía no hay gastos familiares registrados.':
    'No family expenses recorded yet.',
  Miembro: 'Member',
  Tarjeta: 'Card',
  Activo: 'Active',
  Rechazó: 'Declined',

  // Cuentas
  'Tus cuentas y bancos, con saldo y rendimientos.':
    'Your accounts and banks, with balance and yields.',
  '+ Agregar cuenta': '+ Add account',
  '¿Eliminar esta cuenta?': 'Delete this account?',
  'Sin cuentas. Crea una para empezar.': 'No accounts. Create one to get started.',
  'Rendimiento:': 'Yield:',
  mensual: 'monthly',
  'Se implementa en Fase 3': 'Implemented in Phase 3',
  'Plan gratis: máximo 2 cuentas. Actualiza a Premium para agregar más.':
    'Free plan: max 2 accounts. Upgrade to Premium to add more.',
  // AccountForm
  'Nombre de la cuenta': 'Account name',
  'Mi cuenta principal': 'My main account',
  'Banco (opcional)': 'Bank (optional)',
  'Banco X': 'Bank X',
  Corriente: 'Checking',
  Ahorro: 'Savings',
  Inversión: 'Investment',
  Efectivo: 'Cash',
  'Saldo inicial': 'Initial balance',
  'Esta cuenta genera rendimientos': 'This account generates yields',
  'Rendimiento mensual (%)': 'Monthly yield (%)',
  'Crear cuenta': 'Create account',

  // Tarjetas
  'Tarjetas de crédito y débito con límite, uso y fechas.':
    'Credit and debit cards with limit, usage and dates.',
  '+ Agregar tarjeta': '+ Add card',
  '¿Eliminar esta tarjeta?': 'Delete this card?',
  'Sin tarjetas. Crea una para empezar.': 'No cards. Create one to get started.',
  '💳 Crédito': '💳 Credit',
  '💰 Débito': '💰 Debit',
  'Ligada a:': 'Linked to:',
  'Corte:': 'Cut-off:',
  'Pago:': 'Payment:',
  Usado: 'Used',
  Límite: 'Limit',
  Disponible: 'Available',
  Saldo: 'Balance',
  'Plan gratis: máximo 2 tarjetas. Actualiza a Premium para agregar más.':
    'Free plan: max 2 cards. Upgrade to Premium to add more.',
  // CardForm
  'Nombre de la tarjeta': 'Card name',
  'Mi Visa': 'My Visa',
  'Marca (opcional)': 'Brand (optional)',
  'Visa, Mastercard...': 'Visa, Mastercard...',
  'Cuenta ligada': 'Linked account',
  'Límite de crédito': 'Credit limit',
  'Día de corte': 'Cut-off day',
  'Día de pago': 'Payment day',
  'Crear tarjeta': 'Create card',
  // Formato y marca
  Formato: 'Format',
  '💳 Física': '💳 Physical',
  '☁️ Virtual': '☁️ Virtual',
  Virtual: 'Virtual',
  Marca: 'Brand',
  'Selecciona una marca': 'Select a brand',
  'Otra…': 'Other…',
  '¿Cuál marca?': 'Which brand?',
  'Ej: Carnet, UnionPay': 'E.g. Carnet, UnionPay',
  // Líneas de crédito
  'Línea de crédito': 'Credit line',
  'Selecciona una línea': 'Select a line',
  '➕ Nueva línea de crédito': '➕ New credit line',
  'Varias tarjetas del mismo banco comparten un solo límite y las mismas fechas de corte y pago. Selecciona la línea que ya usas o crea una nueva.':
    'Several cards from the same bank share a single limit and the same cut-off and payment dates. Pick the line you already use, or create a new one.',
  'Nombre de la línea': 'Line name',
  'Ej: Nu': 'E.g. Nu',
  'Las fechas se recorren en días inhábiles': 'Dates shift on non-business days',
  'Te preguntaremos la fecha real cuando llegue el corte.':
    "We'll ask you for the real date when the cut-off comes around.",
  'Hereda de {{name}}: límite {{limit}}{{dates}}':
    'Inherits from {{name}}: limit {{limit}}{{dates}}',
  ', corte el día {{cut}} y pago el día {{pay}}':
    ', cut-off on day {{cut}} and payment on day {{pay}}',
  '{{n}} tarjetas · límite compartido': '{{n}} cards · shared limit',
  'Otras tarjetas': 'Other cards',
  'Gasto de esta tarjeta': 'This card’s spend',
  // Periodos de corte/pago
  '¿Tu corte de {{name}} fue el {{date}}?': 'Was your {{name}} cut-off on {{date}}?',
  'Marcaste que esta línea recorre sus fechas en días inhábiles. Confírmala para que los periodos cuadren.':
    'You marked this line as shifting its dates on non-business days. Confirm it so the periods add up.',
  'Sí, fue esa fecha': 'Yes, that was the date',
  'Fue otro día': 'It was another day',
  'Ver historial de periodos': 'View period history',
  // MSI retroactivo
  'Mes en que empezó el plan': 'Month the plan started',
  'Este plan empezó en {{month}} (hace {{n}} meses).':
    'This plan started in {{month}} ({{n}} months ago).',
  '¿Ya pagaste mensualidades anteriores?': 'Have you already paid earlier installments?',
  'Sí, ya pagué algunas': 'Yes, I already paid some',
  '¿Cuántas de {{total}}?': 'How many out of {{total}}?',
  'Se registrará un ajuste de {{amount}} con fecha {{date}} para que el historial no quede negativo.':
    'An adjustment of {{amount}} dated {{date}} will be recorded so your history doesn’t go negative.',
  'Ajuste: {{n}} mensualidades ya pagadas de {{desc}}':
    'Adjustment: {{n}} installments already paid for {{desc}}',
  'Ajuste de saldo': 'Balance adjustment',
  // Total de cuentas
  'Total en cuentas': 'Total in accounts',
  // Rendimientos: tasa anual, plazo fijo, ISR
  'Rendimiento (%)': 'Yield (%)',
  'La tasa es': 'The rate is',
  Anual: 'Annual',
  Mensual: 'Monthly',
  anual: 'annual',
  'Los bancos y SOFIPOs publican la tasa anual. Equivale a {{rate}}% este mes ({{days}} días).':
    'Banks and SOFIPOs publish the annual rate. That is {{rate}}% this month ({{days}} days).',
  'Equivale a {{rate}}% anual.': 'That is {{rate}}% annual.',
  'Tipo de rendimiento': 'Yield type',
  'A la vista (se paga cada mes)': 'On demand (paid monthly)',
  'Plazo fijo (se paga al vencer)': 'Fixed term (paid at maturity)',
  'Plazo (días)': 'Term (days)',
  'Vence el': 'Matures on',
  'plazo fijo': 'fixed term',
  'plazo fijo, vence {{date}}': 'fixed term, matures {{date}}',
  'Descontar retención de ISR': 'Deduct income tax withholding',
  'Se retiene sobre el capital, no sobre el interés. La tasa la fija cada año la Ley de Ingresos.':
    'Withheld on the principal, not on the interest. The rate is set each year by the Revenue Law.',
  'Tasa de ISR anual (%)': 'Annual withholding rate (%)',
  Bruto: 'Gross',
  ISR: 'Tax',
  neto: 'net',
  Visibilidad: 'Visibility',
  'Mostrar total de cuentas': 'Show accounts total',
  'El apartado con la suma de todas tus cuentas, arriba del listado.':
    'The panel with the sum of all your accounts, above the list.',
  confirmado: 'confirmed',
  corte: 'cut-off',
  pago: 'payment',
  días: 'days',
  hoy: 'today',
  'en {{n}} días': 'in {{n}} days',
  'hace {{n}} días': '{{n}} days ago',

  // Categorías
  'Clasifica tus ingresos y gastos.': 'Classify your income and expenses.',
  '+ Agregar categoría': '+ Add category',
  '¿Eliminar esta categoría?': 'Delete this category?',
  Nombre: 'Name',
  'Ej: Gasolina': 'E.g. Gas',
  'Ícono (emoji)': 'Icon (emoji)',
  'Mis categorías': 'My categories',
  'Categorías del sistema': 'System categories',
  'Sin categorías.': 'No categories.',

  // Rendimientos
  'Compara el crecimiento calculado contra el real.':
    'Compare the calculated growth against the actual one.',
  'Esta función es solo para Premium. Actualiza tu plan para usarla.':
    'This feature is Premium only. Upgrade your plan to use it.',
  'Sin cuentas con rendimiento. Crea una cuenta con opción de rendimiento en Cuentas.':
    'No accounts with yield. Create an account with the yield option in Accounts.',
  'Saldo actual': 'Current balance',
  'Crecimiento esperado': 'Expected growth',
  'Crecimiento real': 'Actual growth',
  Histórico: 'History',
  'Esperado:': 'Expected:',
  'Real:': 'Actual:',
  '¿Eliminar este registro?': 'Delete this record?',
  'Registra el crecimiento real': 'Record the actual growth',
  '(Editar)': '(Edit)',
  'de este mes': 'for this month',
  Mes: 'Month',
  'Crecimiento real ($)': 'Actual growth ($)',
  'vs esperado': 'vs expected',
  Actualizar: 'Update',
  Verificar: 'Verify',

  // Conexión
  'Sincroniza tus movimientos directo del banco, sin subir archivos.':
    'Sync your transactions straight from the bank, without uploading files.',
  'Premium · Próximamente': 'Premium · Coming soon',
  'Estamos preparando la conexión directa con bancos y SOFIPOs mediante un agregador de Open Finance. Mientras tanto, puedes traer tus movimientos gratis por dos vías:':
    'We are preparing direct connection with banks and SOFIPOs via an Open Finance aggregator. Meanwhile, you can bring your transactions for free in two ways:',
  'tu estado de cuenta (CSV) — todas las plataformas.':
    'your statement (CSV) — all platforms.',
  'de alertas del banco — casi en tiempo real.':
    "from your bank's alerts — near real time.",
  'de alerta — solo en la app de Android.':
    'alerts — only in the Android app.',
  'Leer SMS': 'Read SMS',
  'La conexión automática estará disponible en el plan Premium.':
    'Auto connection will be available on the Premium plan.',

  // Admin
  'Panel Admin': 'Admin Panel',
  'Gestiona usuarios y sus permisos de premium.':
    'Manage users and their premium permissions.',
  'Sin usuarios.': 'No users.',
  Email: 'Email',
  Estado: 'Status',
  Acciones: 'Actions',
  Gratis: 'Free',
  'Actualizando...': 'Updating...',
  'Quitar Premium': 'Remove Premium',
  'Dar Premium': 'Grant Premium',

  // Correo
  'Lee las alertas de tu banco desde tu Gmail y crea movimientos pendientes. Gratis y casi en tiempo real.':
    'Read your bank alerts from Gmail and create pending transactions. Free and near real time.',
  '1. Remitentes de tu banco': '1. Your bank senders',
  'Indica de qué correos llegan las alertas (ej.':
    'Indicate which emails the alerts come from (e.g.',
  'Solo se leen esos correos.': 'Only those emails are read.',
  Banco: 'Bank',
  'Remitentes (separados por coma)': 'Senders (comma separated)',
  'Regex de monto (opcional)': 'Amount regex (optional)',
  'Guardar remitente': 'Save sender',
  '2. Conecta Gmail y sincroniza': '2. Connect Gmail and sync',
  'Asignar a la cuenta (opcional)': 'Assign to account (optional)',
  'Sin cuenta': 'No account',
  'Conectar Gmail': 'Connect Gmail',
  'Gmail conectado': 'Gmail connected',
  'Sincronizando…': 'Syncing…',
  'Sincronizar ahora': 'Sync now',
  'Agrega al menos un remitente arriba antes de sincronizar.':
    'Add at least one sender above before syncing.',
  'Los movimientos se crean como pendientes: revísalos y confírmalos en Transacciones para que cuenten en tus saldos.':
    'Transactions are created as pending: review and confirm them in Transactions so they count in your balances.',
  'Correos encontrados: {{found}}. Movimientos nuevos (pendientes): {{inserted}}{{dups}}.':
    'Emails found: {{found}}. New transactions (pending): {{inserted}}{{dups}}.',
  ', {{n}} duplicados': ', {{n}} duplicates',

  // SMS
  'Lee las alertas de compra por SMS de tu banco. Disponible solo en la app de Android.':
    'Read your bank purchase alerts via SMS. Available only in the Android app.',
  '📵 Apple no permite que las apps lean SMS. En iPhone usa "Sincronizar correo" o "Importar" tu estado de cuenta.':
    '📵 Apple does not allow apps to read SMS. On iPhone use "Sync email" or "Import" your statement.',
  'Esta función solo está disponible en la app instalada de Android. En el navegador no se pueden leer SMS.':
    'This feature is only available in the installed Android app. SMS cannot be read in the browser.',
  '1. Remitentes de SMS de tu banco': '1. Your bank SMS senders',
  'Remitentes (coma)': 'Senders (comma)',
  '2. Leer SMS': '2. Read SMS',
  'Leyendo…': 'Reading…',
  'Leer SMS y crear pendientes': 'Read SMS and create pending',
  'Se pedirá permiso para leer SMS. Los movimientos se crean como pendientes; confírmalos en Transacciones.':
    'Permission to read SMS will be requested. Transactions are created as pending; confirm them in Transactions.',
  'SMS leídos: {{found}}. Movimientos nuevos (pendientes): {{inserted}}{{dups}}.':
    'SMS read: {{found}}. New transactions (pending): {{inserted}}{{dups}}.',

  // Importar
  'Importar movimientos': 'Import transactions',
  'Sube el estado de cuenta (CSV) de tu banco y conviértelo en transacciones. Tus datos no salen a terceros.':
    "Upload your bank's statement (CSV) and turn it into transactions. Your data isn't shared with third parties.",
  'Primero crea una cuenta para poder importar movimientos.':
    'First create an account to import transactions.',
  '1. Cuenta destino y archivo': '1. Destination account and file',
  'Usar mapeo guardado': 'Use saved mapping',
  'Nuevo mapeo…': 'New mapping…',
  'Archivo CSV': 'CSV file',
  '2. Mapea las columnas de {{file}}': '2. Map the columns of {{file}}',
  'La primera fila son encabezados': 'The first row are headers',
  'Columna de Fecha': 'Date column',
  'Formato de fecha': 'Date format',
  'Columna de Concepto': 'Concept column',
  'Formato de monto': 'Amount format',
  'Una columna con signo (+/-)': 'One column with sign (+/-)',
  'Columnas de cargo y abono': 'Debit and credit columns',
  'Columna de Monto': 'Amount column',
  'Columna de Cargo (egreso)': 'Debit column (expense)',
  'Columna de Abono (ingreso)': 'Credit column (income)',
  'Separador decimal': 'Decimal separator',
  'Punto (1,234.56)': 'Dot (1,234.56)',
  'Coma (1.234,56)': 'Comma (1.234,56)',
  'Categoría por defecto (opcional)': 'Default category (optional)',
  'Nombre del banco (para guardar el mapeo)': 'Bank name (to save the mapping)',
  'Ej. BBVA, Nu, Klar…': 'E.g. BBVA, Nu, Klar…',
  'Guardar mapeo': 'Save mapping',
  '— sin asignar —': '— unassigned —',
  'Columna {{n}}': 'Column {{n}}',
  '3. Previsualización ({{count}} movimientos)': '3. Preview ({{count}} transactions)',
  '({{n}} con error)': '({{n}} with error)',
  'Importando…': 'Importing…',
  'Confirmar e importar ({{count}})': 'Confirm and import ({{count}})',
  'Selecciona la cuenta destino para poder importar.':
    'Select the destination account to import.',
  'Mostrando 200 de {{total}}. Se importarán todos.':
    'Showing 200 of {{total}}. All will be imported.',
  'Importadas {{inserted}} de {{total}} ({{duplicates}} duplicadas omitidas).':
    'Imported {{inserted}} of {{total}} ({{duplicates}} duplicates skipped).',

  // PremiumGate
  'Plan gratis: máximo 2. Actualiza a Premium para más.':
    'Free plan: max 2. Upgrade to Premium for more.',

  // Configuración
  'Tu cuenta y preferencias': 'Your account and preferences',
  Perfil: 'Profile',
  'El nombre y la foto vienen de tu cuenta de Google.':
    'Your name and photo come from your Google account.',
  Apariencia: 'Appearance',
  Claro: 'Light',
  Oscuro: 'Dark',
  Sistema: 'System',
  Idioma: 'Language',
  Teléfono: 'Phone',
  'Sin teléfono conectado. Próximamente podrás vincular tu número con verificación por SMS.':
    'No phone connected. Soon you will be able to link your number with SMS verification.',
  Suscripción: 'Subscription',
  'Tienes acceso a todas las funciones.': 'You have access to all features.',
  'Plan gratuito. Premium desbloquea plan familiar, MSI/diferidos y rendimientos.':
    'Free plan. Premium unlocks family plan, installments and yields.',
  'Plan familiar': 'Family plan',
  'Tienes {{count}} invitación(es) pendiente(s).':
    'You have {{count}} pending invitation(s).',
  '(eres el jefe de familia)': '(you are the family head)',
  '(miembro)': '(member)',
  'Ver familia': 'View family',
  'No participas en ningún plan familiar.': 'You are not part of any family plan.',
  'Crearlo requiere Premium.': 'Creating one requires Premium.',
  'Saber más': 'Learn more',
  Sesión: 'Session',
  'Cerrar sesión': 'Sign out',

  // Stripe / suscripción
  'Gestionar suscripción': 'Manage subscription',
  'Hacerse Premium': 'Go Premium',
  'Abriendo…': 'Opening…',

  // Teléfono / SMS
  Cambiar: 'Change',
  'Número de teléfono': 'Phone number',
  'Código de verificación': 'Verification code',
  'Enviar código': 'Send code',
  'Enviando…': 'Sending…',
  'Verificando…': 'Verifying…',
  'Reenviar código': 'Resend code',
  'Reenviar en {{s}}s': 'Resend in {{s}}s',
  'Escribe tu número en formato internacional, ej. +5215512345678':
    'Enter your number in international format, e.g. +5215512345678',
  'El envío de SMS no está configurado. Contacta al administrador.':
    'SMS sending is not configured. Contact the administrator.',
  'No se pudo enviar el código.': 'Could not send the code.',
  'Código incorrecto.': 'Incorrect code.',

  // Login (correo / código)
  'o con tu correo': 'or with your email',
  'tucorreo@ejemplo.com': 'youremail@example.com',
  'Escribe tu correo.': 'Enter your email.',
  'Te enviamos un código de acceso a {{email}}.':
    'We sent an access code to {{email}}.',
  'Escribe el código completo que te llegó al correo.':
    'Enter the full code you received by email.',
  'Código incorrecto o expirado. Intenta de nuevo.':
    'Incorrect or expired code. Try again.',
  'Verificar y entrar': 'Verify and enter',
  'Usar otro correo': 'Use another email',
  '← Volver al inicio': '← Back to home',

  // Landing
  'Iniciar sesión': 'Sign in',
  'Tus finanzas personales, claras y en un solo lugar.':
    'Your personal finances, clear and all in one place.',
  'Organiza ingresos, gastos, cuentas y tarjetas. Escanea recibos y entiende a dónde va tu dinero.':
    'Organize income, expenses, accounts and cards. Scan receipts and understand where your money goes.',
  'Crear cuenta gratis': 'Create free account',
  'Ya tengo cuenta': 'I already have an account',
  'Todas las funciones gratuitas por el momento.':
    'All features free for now.',
  'Cómo funciona': 'How it works',
  'Conecta tus cuentas': 'Connect your accounts',
  'Registra cuentas y tarjetas, o sincroniza tus movimientos desde el correo.':
    'Add accounts and cards, or sync your transactions from email.',
  'Captura sin esfuerzo': 'Capture effortlessly',
  'Escanea tickets y facturas con la cámara o sube un PDF; Mi Control de Finanzas Personales extrae los datos.':
    'Scan receipts and invoices with the camera or upload a PDF; Mi Control de Finanzas Personales extracts the data.',
  'Entiende tu dinero': 'Understand your money',
  'Mira tu balance, gastos por categoría y reportes claros en un solo lugar.':
    'See your balance, spending by category and clear reports all in one place.',
  'Todo lo que necesitas': 'Everything you need',
  'Cuentas y tarjetas': 'Accounts and cards',
  'Controla saldos, límites y fechas de corte.':
    'Track balances, limits and cut-off dates.',
  'Recibos con OCR': 'Receipts with OCR',
  'Foto o PDF del ticket y listo.': 'A photo or PDF of the receipt and done.',
  'Sincronización por correo': 'Email sync',
  'Importa cargos desde tus notificaciones.':
    'Import charges from your notifications.',
  'Comparte tarjetas y gastos con tu familia.':
    'Share cards and expenses with your family.',
  'Multi-moneda': 'Multi-currency',
  'Registra en varias monedas.': 'Record in several currencies.',
  'Modo oscuro e idiomas': 'Dark mode and languages',
  'Español e inglés, claro y oscuro.': 'Spanish and English, light and dark.',
  'Llévala en tu celular': 'Take it on your phone',
  'Aplicación': 'App',
  'Instala Mi Control de Finanzas Personales en tu teléfono y llévala contigo.':
    'Install Mi Control de Finanzas Personales on your phone and take it with you.',
  'Versión {{version}}': 'Version {{version}}',
  'Empezar ahora': 'Start now',
  '¿Ideas para mejorar?': 'Ideas to improve?',
  'Cuéntanos qué te gustaría ver en Mi Control de Finanzas Personales. Leemos todos los comentarios.':
    'Tell us what you would like to see in Mi Control de Finanzas Personales. We read every comment.',
  'Tu nombre (opcional)': 'Your name (optional)',
  'Tu correo (opcional)': 'Your email (optional)',
  '¿Qué te gustaría mejorar o agregar?': 'What would you like to improve or add?',
  'Enviar comentario': 'Send comment',
  'No se pudo enviar. Intenta más tarde.': 'Could not send. Try again later.',
  '¡Gracias! Recibimos tu comentario.': 'Thanks! We received your comment.',
  'Mi Control de Finanzas Personales — Finanzas personales.': 'Mi Control de Finanzas Personales — Personal finance.',

  // Multimoneda
  'Moneda principal': 'Main currency',
  'Tu balance y reportes se muestran en esta moneda. Los movimientos en otra moneda se convierten con el tipo de cambio.':
    'Your balance and reports are shown in this currency. Transactions in another currency are converted using the exchange rate.',
  'Tipo de cambio ({{from}}→{{to}})': 'Exchange rate ({{from}}→{{to}})',
  'Obteniendo…': 'Fetching…',
  'Equivale a': 'Equivalent to',
  'No se obtuvo el tipo de cambio automático. Escríbelo manualmente.':
    'The automatic exchange rate was not obtained. Enter it manually.',
  'Puedes ajustar el tipo de cambio si lo necesitas.':
    'You can adjust the exchange rate if you need to.',
  'Escribe un tipo de cambio válido.': 'Enter a valid exchange rate.',
  'Obteniendo tipo de cambio…': 'Fetching exchange rate…',
  '≈ {{base}} en tu moneda principal (tipo de cambio {{rate}}).':
    '≈ {{base}} in your main currency (rate {{rate}}).',
  'No se obtuvo el tipo de cambio. Registra el gasto desde Transacciones para ajustarlo.':
    'The exchange rate was not obtained. Record the expense from Transactions to adjust it.',
  'No se obtuvo el tipo de cambio. Intenta de nuevo o registra el gasto desde Transacciones.':
    'The exchange rate was not obtained. Try again or record the expense from Transactions.',

  // MVP 3 — Familia
  'Eliminar familia': 'Delete family',
  '¿Eliminar la familia "{{name}}"? Se borrarán los gastos familiares, los miembros y las tarjetas compartidas. Esta acción no se puede deshacer.':
    'Delete the family "{{name}}"? Family expenses, members and shared cards will be removed. This action cannot be undone.',

  // MVP 3 — Galería de emojis
  'Ícono': 'Icon',
  Dinero: 'Money',
  Comida: 'Food',
  Transporte: 'Transport',
  Hogar: 'Home',
  Salud: 'Health',
  Ocio: 'Leisure',
  Deportes: 'Sports',
  Compras: 'Shopping',
  'Trabajo/Estudio': 'Work/Study',
  Otros: 'Other',

  // MVP 3 — Beca
  Beca: 'Scholarship',
  'Es una cuenta de beca': 'This is a scholarship account',
  'Es una tarjeta de beca': 'This is a scholarship card',
  'Nombre de la beca (opcional)': 'Scholarship name (optional)',
  'Ej: Beca Benito Juárez': 'E.g. Benito Juárez Scholarship',

  // MVP 3 — Admin
  'Hacer Admin': 'Make Admin',
  'Quitar Admin': 'Remove Admin',
  'No puedes quitarte admin a ti mismo': "You can't remove your own admin",

  // MVP 4 — Tarjetas visuales + escaneo
  'Crédito': 'Credit',
  'Débito': 'Debit',
  'Escanear tarjeta con la cámara': 'Scan card with the camera',
  'Leyendo tarjeta…': 'Reading card…',
  'Por tu seguridad solo se leen la marca y los últimos 4 dígitos. No se guarda el número completo, CVC ni la fecha.':
    'For your security only the brand and last 4 digits are read. The full number, CVC and expiry date are not stored.',
  'Detectado: {{brand}} ····{{last4}}. Revisa y completa los datos.':
    'Detected: {{brand}} ····{{last4}}. Review and complete the details.',
  tarjeta: 'card',
  'No se detectaron los datos. Captúralos manualmente.':
    'No data detected. Enter it manually.',
  'No se pudo leer la tarjeta: {{error}}. Captúrala manualmente.':
    'Could not read the card: {{error}}. Enter it manually.',
  'Últimos 4 dígitos (opcional)': 'Last 4 digits (optional)',
  'Color de la tarjeta': 'Card color',

  // MVP 5 — Config admin (límites y premium)
  'Plan gratis: máximo {{n}} cuentas. Actualiza a Premium para agregar más.':
    'Free plan: max {{n}} accounts. Upgrade to Premium to add more.',
  'Plan gratis: máximo {{n}} tarjetas. Actualiza a Premium para agregar más.':
    'Free plan: max {{n}} cards. Upgrade to Premium to add more.',
  'Plan gratis: máximo {{n}} transacciones. Actualiza a Premium para registrar más.':
    'Free plan: max {{n}} transactions. Upgrade to Premium to record more.',
  'Planes y límites': 'Plans and limits',
  'Define los límites del plan gratis (0 = ilimitado) y qué funciones requieren Premium.':
    'Set the free plan limits (0 = unlimited) and which features require Premium.',
  'Máx. cuentas (gratis)': 'Max accounts (free)',
  'Máx. tarjetas (gratis)': 'Max cards (free)',
  'Máx. transacciones (gratis)': 'Max transactions (free)',
  'Funciones que requieren Premium': 'Features that require Premium',
  'Meses sin intereses / diferido': 'Interest-free months / deferred',
  'Filtros de reportes': 'Report filters',
  'Guardar configuración': 'Save configuration',
  'Guardado ✓': 'Saved ✓',

  // MVP 6 — XML CFDI
  'Fotografía el ticket con buena luz y lo más plano posible, o sube un PDF o XML (factura CFDI) de tu recibo. Después podrás revisar y corregir los datos detectados.':
    'Photograph the receipt with good light and as flat as possible, or upload a PDF or XML (CFDI invoice). Then you can review and correct the detected data.',
  'o subir una imagen, PDF o XML (factura)': 'or upload an image, PDF or XML (invoice)',
  'El XML no parece una factura CFDI (SAT). Verifica el archivo.':
    'The XML does not look like a CFDI (SAT) invoice. Check the file.',
  'No se pudo leer el XML: {{error}}.': 'Could not read the XML: {{error}}.',

  // MVP 7 — Actualización y descarga
  'Hay una nueva versión disponible.': 'A new version is available.',
  'Hay una nueva versión ({{v}}). Descarga la actualización.':
    'A new version ({{v}}) is available. Download the update.',
  Descargar: 'Download',
  Cerrar: 'Close',
  'Instálala como app desde tu navegador, o descarga el APK para Android.':
    'Install it as an app from your browser, or download the APK for Android.',
  'Descargar app (Android)': 'Download app (Android)',
  'En Android, permite instalar apps de orígenes desconocidos al abrir el archivo.':
    'On Android, allow installing apps from unknown sources when opening the file.',

  // Nombres de las categorías del sistema (viven en la BD en español; se
  // traducen al mostrarlas). Comida/Transporte/Hogar/Salud/Compras/
  // Rendimientos ya están arriba.
  Salario: 'Salary',
  'Otros ingresos': 'Other income',
  'Otros gastos': 'Other expenses',
  Entretenimiento: 'Entertainment',
  Servicios: 'Utilities',
  Cashback: 'Cashback',
  // 'Sin categoría' ya está definida más arriba.

  // Ajustes 2 — privacidad, gráficas y export
  'Ocultar montos': 'Hide amounts',
  'Mostrar montos': 'Show amounts',
  Color: 'Color',
  'Guardar cambios': 'Save changes',
  'Ofrece cashback': 'Offers cashback',
  '(regístralo como ingreso con la categoría Cashback)':
    '(record it as income using the Cashback category)',
  Barras: 'Bars',
  Líneas: 'Lines',
  Pastel: 'Pie',
  Dona: 'Donut',
  'Paleta de colores': 'Color palette',
  'Por categoría': 'By category',
  Vivo: 'Vivid',
  Océano: 'Ocean',
  Cálido: 'Warm',
  Ingresos: 'Income',
  Egresos: 'Expenses',
  'Gastos por categoría': 'Expenses by category',
  'Exportar a Excel': 'Export to Excel',
  'Tablas y gráficos': 'Tables and charts',
  'Solo tablas': 'Tables only',
  'Solo gráficos': 'Charts only',
  'Descargar Excel': 'Download Excel',
  'Exportando…': 'Exporting…',
  'No se pudo exportar: {{error}}': 'Could not export: {{error}}',

  // Ajustes 2 — tema configurable por admin
  'Colores de la app': 'App colors',
  'Personaliza el color de acento y los fondos. Aplica a toda la web y la app.':
    'Customize the accent color and backgrounds. Applies to the whole web and app.',
  'Acento (marca)': 'Accent (brand)',
  'Fondo (claro)': 'Background (light)',
  'Superficie (claro)': 'Surface (light)',
  'Fondo (oscuro)': 'Background (dark)',
  'Superficie (oscuro)': 'Surface (dark)',
  'Guardar colores': 'Save colors',
  Restablecer: 'Reset',
  'Categoría del sistema (editable por admin)': 'System category (admin editable)',

  // Recibos — ingreso o gasto
  'Toma una foto del ticket o sube una factura y registra el movimiento automáticamente':
    'Take a photo of the receipt or upload an invoice and record the transaction automatically',
  'Registrar ingreso': 'Save income',
  'Ingreso registrado correctamente.': 'Income recorded successfully.',
  'Cuenta donde entró el dinero': 'Account the money went into',
  'Selecciona la cuenta donde entró el dinero': 'Select the account the money went into',

  // Selector de color de tarjeta
  Guardados: 'Saved',
  'Más colores…': 'More colors…',
  Elegir: 'Pick',
  Hex: 'Hex',
  'Vista previa': 'Preview',
  'Usar y guardar': 'Use and save',
  Quitar: 'Remove',

  // Presupuestos
  'Cuánto puedes gastar en cada categoría y cómo vas en el periodo.':
    'How much you can spend per category and how you are doing this period.',
  '+ Nuevo presupuesto': '+ New budget',
  'Crear presupuesto': 'Create budget',
  'Sin presupuestos. Crea uno general o por categoría para ver cuánto llevas gastado.':
    'No budgets yet. Create a general one or one per category to track your spending.',
  'Sin presupuestos configurados.': 'No budgets configured.',
  'General (todas las categorías)': 'General (all categories)',
  General: 'General',
  'Monto máximo': 'Spending limit',
  Periodo: 'Period',
  Diario: 'Daily',
  Semanal: 'Weekly',
  Quincenal: 'Biweekly',
  // 'Mensual' y 'Activo' ya están traducidos más arriba.
  'Se reinicia cada día.': 'Resets every day.',
  'De lunes a domingo.': 'Monday through Sunday.',
  'Del 1 al 15 y del 16 a fin de mes.': 'From the 1st to the 15th, and the 16th to month end.',
  'Del día 1 a fin de mes.': 'From the 1st to month end.',
  'Avisarme al llegar a (%)': 'Alert me at (%)',
  'Avisarme al llegar a': 'Alert me at',
  'Si lo dejas vacío se usa tu umbral general ({{n}}%), configurable en Configuración.':
    'Leave empty to use your general threshold ({{n}}%), configurable in Settings.',
  'Se usa en los presupuestos que no definen su propio umbral. Te avisamos una vez por periodo al cruzarlo, y otra si lo excedes.':
    'Used by budgets without their own threshold. We alert you once per period when you cross it, and again if you go over.',
  'Ver mis presupuestos': 'View my budgets',
  'Avisarme también por correo': 'Also alert me by email',
  'Un correo al día con los presupuestos que cruzaron su límite. Nunca se repite el mismo aviso.':
    'One email a day with the budgets that crossed their limit. The same alert is never repeated.',
  'Al desactivarlo deja de calcularse y de avisarte, sin borrarlo.':
    'Deactivating stops its tracking and alerts without deleting it.',
  Inactivos: 'Inactive',
  'Ya existe un presupuesto para esa categoría.': 'A budget already exists for that category.',
  '¿Eliminar el presupuesto de "{{name}}"?': 'Delete the "{{name}}" budget?',
  'este presupuesto': 'this budget',
  'Te quedan': 'Left',
  'Excedido por': 'Over by',
  'excedido por': 'over by',
  'por revisar': 'to review',
  'avisa al {{n}}%': 'alerts at {{n}}%',
  Gastado: 'Spent',
  Restante: 'Remaining',
  'Dentro del presupuesto': 'Within budget',
  'Cerca del límite': 'Near the limit',
  Excedido: 'Over budget',
  'Plan gratis: máximo {{n}} presupuestos. Actualiza a Premium para agregar más.':
    'Free plan: up to {{n}} budgets. Upgrade to Premium to add more.',
  'Máx. presupuestos (gratis)': 'Max. budgets (free)',
  // Avisos de presupuesto
  'Llevas {{percent}}% de tu presupuesto de {{name}} ({{spent}} de {{amount}}).':
    'You are at {{percent}}% of your {{name}} budget ({{spent}} of {{amount}}).',
  'Excediste tu presupuesto de {{name}}: llevas {{spent}} de {{amount}}.':
    'You went over your {{name}} budget: {{spent}} of {{amount}}.',
  'tu presupuesto': 'your budget',
  Ver: 'View',
  Entendido: 'Got it',

  // Legal (Términos y Privacidad)
  'Términos y Condiciones': 'Terms and Conditions',
  'Política de Privacidad': 'Privacy Policy',
  'Última actualización: {{date}}': 'Last updated: {{date}}',

  // Términos — encabezados
  'Aceptación de los términos': 'Acceptance of the terms',
  'Qué es (y qué no es) la app': 'What the app is (and is not)',
  'Tu cuenta': 'Your account',
  'Uso aceptable': 'Acceptable use',
  'Sincronización con Google y captura de SMS': 'Syncing with Google and SMS capture',
  Precios: 'Pricing',
  'Propiedad intelectual': 'Intellectual property',
  'Limitación de responsabilidad': 'Limitation of liability',
  'Cancelación de tu cuenta': 'Cancelling your account',
  'Cambios a estos términos': 'Changes to these terms',
  'Ley aplicable': 'Governing law',
  Contacto: 'Contact',

  // Términos — párrafos
  'Al crear una cuenta o usar Mi Control de Finanzas Personales ("la app") aceptas estos Términos y Condiciones. Si no estás de acuerdo, no uses la app.':
    'By creating an account or using Mi Control de Finanzas Personales ("the app") you accept these Terms and Conditions. If you do not agree, do not use the app.',
  'La app es una herramienta para llevar el registro y la organización de tus finanzas personales: cuentas, tarjetas, transacciones, presupuestos y reportes.':
    'The app is a tool for tracking and organizing your personal finances: accounts, cards, transactions, budgets and reports.',
  'La app no es un banco, una institución financiera, un asesor financiero ni un intermediario de pagos. No movemos tu dinero, no tenemos acceso a tus contraseñas bancarias y no damos asesoría de inversión. La información que muestra la app depende de los datos que tú capturas o autorizas a sincronizar, y puede contener errores o retrasos.':
    'The app is not a bank, a financial institution, a financial advisor or a payment intermediary. We do not move your money, we do not have access to your bank passwords, and we do not provide investment advice. The information the app shows depends on the data you enter or authorize it to sync, and it may contain errors or delays.',
  'Debes tener al menos 18 años para crear una cuenta. Eres responsable de mantener segura tu contraseña y de toda la actividad que ocurra en tu cuenta.':
    'You must be at least 18 years old to create an account. You are responsible for keeping your password secure and for all activity on your account.',
  'La información que registras (cuentas, tarjetas, montos) debe ser información que tengas derecho a compartir; no uses la app para registrar datos financieros de terceros sin su consentimiento, salvo dentro de un plan familiar compartido que tú mismo administras.':
    'The information you record (accounts, cards, amounts) must be information you have the right to share; do not use the app to record third parties\' financial data without their consent, except within a shared family plan that you manage yourself.',
  'No debes usar la app para actividades ilegales, para intentar acceder a cuentas de otros usuarios sin autorización, ni para interferir con el funcionamiento del servicio.':
    'You must not use the app for illegal activities, to attempt to access other users\' accounts without authorization, or to interfere with the operation of the service.',
  'Las funciones de "Sincronizar correo" (Gmail, solo lectura) y "Sincronizar SMS" (solo Android) son opcionales y requieren tu autorización explícita. Puedes desactivarlas en cualquier momento desde la app. El tratamiento de estos datos se rige por la Política de Privacidad.':
    'The "Sync email" (Gmail, read-only) and "Sync SMS" (Android only) features are optional and require your explicit authorization. You can turn them off at any time from within the app. The handling of this data is governed by the Privacy Policy.',
  'Mientras la conexión con Gmail esté en modo de prueba ante Google, solo los correos agregados como "usuarios de prueba" en la consola de Google Cloud podrán usar esa función; esta limitación es de Google, no de la app.':
    'While the Gmail connection is in testing mode with Google, only email addresses added as "test users" in the Google Cloud console can use that feature; this limitation comes from Google, not from the app.',
  'Todas las funciones de la app son gratuitas por el momento. Si en el futuro se introducen planes de pago, se te avisará con anticipación antes de que se te cobre algo.':
    'All app features are free for now. If paid plans are introduced in the future, you will be notified in advance before anything is charged.',
  'La app, su diseño, código y marca nos pertenecen. Tú conservas la propiedad de los datos financieros que capturas; nos das permiso únicamente para almacenarlos y procesarlos con el fin de prestarte el servicio.':
    'The app, its design, code and brand belong to us. You retain ownership of the financial data you enter; you grant us permission only to store and process it in order to provide you the service.',
  'La app se ofrece "tal cual", sin garantías de que esté libre de errores o interrupciones. En la medida permitida por la ley, no somos responsables de decisiones financieras que tomes con base en la información mostrada por la app, ni de pérdidas derivadas de errores de sincronización, del correo o del SMS, o de fallas de servicios de terceros (Google, Supabase, tu banco).':
    'The app is provided "as is", without guarantees that it is free of errors or interruptions. To the extent permitted by law, we are not responsible for financial decisions you make based on information shown by the app, nor for losses arising from sync errors, email or SMS, or failures of third-party services (Google, Supabase, your bank).',
  'Puedes dejar de usar la app y solicitar la eliminación de tu cuenta y tus datos en cualquier momento escribiendo a {{email}}. Podemos suspender o cancelar cuentas que incumplan estos términos.':
    'You can stop using the app and request deletion of your account and data at any time by writing to {{email}}. We may suspend or cancel accounts that violate these terms.',
  'Podemos actualizar estos términos ocasionalmente. Publicaremos cualquier cambio en esta misma página con la fecha de actualización correspondiente.':
    'We may update these terms from time to time. We will publish any changes on this same page with the corresponding update date.',
  'Estos términos se rigen por las leyes de México, sin perjuicio de los derechos que la legislación de tu país de residencia te reconozca como consumidor.':
    'These terms are governed by the laws of Mexico, without prejudice to the rights that the laws of your country of residence grant you as a consumer.',
  '¿Dudas sobre estos términos? Escríbenos a {{email}}.':
    'Questions about these terms? Write to us at {{email}}.',

  // Privacidad — encabezados
  'Quiénes somos': 'Who we are',
  'Qué datos recopilamos': 'What data we collect',
  'Uso de datos obtenidos mediante las APIs de Google': 'Use of data obtained through Google APIs',
  'Cómo usamos tus datos': 'How we use your data',
  'Con quién compartimos tus datos': 'Who we share your data with',
  'Retención y eliminación de datos': 'Data retention and deletion',
  Seguridad: 'Security',
  'Tus derechos': 'Your rights',
  'Menores de edad': 'Minors',
  'Cambios a esta política': 'Changes to this policy',

  // Privacidad — párrafos
  'Mi Control de Finanzas Personales ("la app", "nosotros") es una aplicación de finanzas personales que te ayuda a organizar ingresos, gastos, cuentas, tarjetas y presupuestos. Esta política explica qué datos recopilamos, cómo los usamos y qué derechos tienes sobre ellos.':
    'Mi Control de Finanzas Personales ("the app", "we") is a personal finance app that helps you organize income, expenses, accounts, cards and budgets. This policy explains what data we collect, how we use it, and what rights you have over it.',
  'Datos de cuenta: nombre, correo electrónico y, si inicias sesión con Google, tu nombre y correo asociados a tu cuenta de Google.':
    'Account data: name, email address, and, if you sign in with Google, the name and email associated with your Google account.',
  'Datos financieros que capturas tú mismo: cuentas, tarjetas, líneas de crédito, transacciones, categorías, presupuestos y montos, ya sea escritos a mano, importados desde un archivo, o extraídos de un recibo/factura que fotografías o subes.':
    'Financial data you enter yourself: accounts, cards, credit lines, transactions, categories, budgets and amounts, whether typed in by hand, imported from a file, or extracted from a receipt/invoice you photograph or upload.',
  'Datos de sincronización opcional por correo: si activas "Sincronizar correo" y conectas tu cuenta de Gmail, la app lee únicamente los mensajes que coinciden con reglas de remitente que tú configuras (por ejemplo, notificaciones de tu banco o de servicios como Xsolla/EBANX), extrae de ellos los datos de una transacción (monto, fecha, concepto) y no guarda el contenido completo del correo.':
    'Optional email sync data: if you turn on "Sync email" and connect your Gmail account, the app only reads messages that match sender rules you configure (for example, notifications from your bank or services like Xsolla/EBANX), extracts transaction data from them (amount, date, description), and does not store the full email content.',
  'Datos de sincronización opcional por SMS (solo Android): si activas "Sincronizar SMS", la app lee los mensajes de texto entrantes para detectar avisos de transacciones bancarias y extraer monto, fecha y concepto; no se sube ni se comparte el contenido completo del SMS ni los mensajes que no correspondan a movimientos financieros.':
    'Optional SMS sync data (Android only): if you turn on "Sync SMS", the app reads incoming text messages to detect bank transaction alerts and extract amount, date and description; the full SMS content is not uploaded or shared, nor are messages that are not financial transactions.',
  'Datos de uso: información técnica básica para el funcionamiento de la app (por ejemplo, idioma preferido, tema claro/oscuro, y registros de error para poder corregir fallas).':
    'Usage data: basic technical information needed to run the app (for example, preferred language, light/dark theme, and error logs so we can fix bugs).',
  'El uso y la transferencia de información recibida desde las APIs de Google por parte de Mi Control de Finanzas Personales se ajustará a la Política de Datos de Usuario de los Servicios de API de Google (Google API Services User Data Policy), incluidos los requisitos de Uso Limitado ("Limited Use").':
    "Mi Control de Finanzas Personales's use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.",
  'En concreto: el acceso de solo lectura a Gmail (scope gmail.readonly) se usa exclusivamente para detectar transacciones financieras en los correos que coinciden con las reglas de remitente que tú configuras dentro de la app. No usamos estos datos para publicidad, no los vendemos, no los compartimos con terceros salvo lo necesario para operar el servicio (ver "Con quién compartimos tus datos"), y ningún humano lee tu correo salvo que sea estrictamente necesario para dar soporte técnico que tú mismo solicites, para cumplir la ley, o para investigar un uso indebido.':
    'Specifically: read-only Gmail access (the gmail.readonly scope) is used exclusively to detect financial transactions in emails that match the sender rules you configure inside the app. We do not use this data for advertising, we do not sell it, and we do not share it with third parties except as necessary to operate the service (see "Who we share your data with"); no human reads your email unless strictly necessary to provide technical support you request, to comply with the law, or to investigate misuse.',
  'Puedes revocar el acceso de la app a tu cuenta de Google en cualquier momento desde la configuración de tu cuenta de Google (myaccount.google.com/permissions) o desde la sección "Sincronizar correo" dentro de la app.':
    'You can revoke the app\'s access to your Google account at any time from your Google account settings (myaccount.google.com/permissions) or from the "Sync email" section inside the app.',
  'Usamos tus datos para operar la app: mostrar tus saldos, transacciones, reportes y presupuestos; enviarte notificaciones relacionadas con tu cuenta; y responder a tus comentarios o solicitudes de soporte.':
    'We use your data to run the app: showing your balances, transactions, reports and budgets; sending you notifications related to your account; and responding to your feedback or support requests.',
  'No usamos tus datos financieros para publicidad ni los vendemos a terceros.':
    'We do not use your financial data for advertising, nor do we sell it to third parties.',
  'Usamos Supabase como proveedor de infraestructura (base de datos, autenticación y funciones del servidor) para operar la app; Supabase procesa los datos en nuestro nombre bajo sus propias medidas de seguridad, y no los usa para sus propios fines.':
    'We use Supabase as our infrastructure provider (database, authentication and server functions) to run the app; Supabase processes data on our behalf under its own security measures, and does not use it for its own purposes.',
  'Cuando inicias sesión con Google, o conectas Gmail, compartimos información con Google únicamente en la medida necesaria para autenticarte o para leer los correos que tú autorizas, conforme a esta política.':
    'When you sign in with Google, or connect Gmail, we share information with Google only to the extent necessary to authenticate you or to read the emails you authorize, in accordance with this policy.',
  'No compartimos tus datos financieros con anunciantes ni los vendemos a terceros.':
    'We do not share your financial data with advertisers, nor do we sell it to third parties.',
  'Conservamos tus datos mientras tu cuenta esté activa. Puedes exportar tus transacciones a Excel en cualquier momento desde la app.':
    'We keep your data while your account is active. You can export your transactions to Excel at any time from the app.',
  'Si quieres eliminar tu cuenta y tus datos, escríbenos a {{email}} y lo haremos en un plazo razonable, salvo la información que debamos conservar por obligación legal.':
    'If you want to delete your account and your data, write to us at {{email}} and we will do so within a reasonable time, except for information we must retain due to legal obligations.',
  'Tus datos se transmiten mediante conexiones cifradas (HTTPS) y se almacenan con controles de acceso a nivel de fila (row-level security), de modo que cada usuario solo puede ver su propia información o la de una familia/cuenta compartida a la que fue invitado explícitamente.':
    'Your data is transmitted over encrypted connections (HTTPS) and stored with row-level security access controls, so each user can only see their own information or that of a shared family/account they were explicitly invited to.',
  'Puedes acceder, corregir, exportar o solicitar la eliminación de tus datos personales en cualquier momento, ya sea desde la propia app (sección "Configuración") o escribiéndonos a {{email}}.':
    'You can access, correct, export or request deletion of your personal data at any time, either from within the app itself ("Settings" section) or by writing to us at {{email}}.',
  'La app no está dirigida a menores de 18 años y no recopilamos intencionalmente datos de menores.':
    'The app is not directed at anyone under 18 and we do not knowingly collect data from minors.',
  'Podemos actualizar esta política ocasionalmente. Publicaremos cualquier cambio en esta misma página con la fecha de actualización correspondiente.':
    'We may update this policy from time to time. We will publish any changes on this same page with the corresponding update date.',
  '¿Dudas sobre esta política? Escríbenos a {{email}}.':
    'Questions about this policy? Write to us at {{email}}.',

  // Ajustes 6 — panel de periodo pagado
  'Periodo pagado': 'Period paid',
  'Gasto acumulado del periodo siguiente:': 'Spending accrued for next period:',
  pagado: 'paid',

  // Ajustes 6 — tutorial guiado y novedades
  '¡Bienvenido a {{app}}!': 'Welcome to {{app}}!',
  'Un vistazo rápido a lo que puedes hacer aquí. Puedes saltarte esto y consultarlo después con el botón de ayuda de cada sección.':
    "A quick look at what you can do here. You can skip this and check it later with each section's help button.",
  Anterior: 'Back',
  Siguiente: 'Next',
  Omitir: 'Skip',
  Empezar: 'Get started',
  'Ayuda de esta sección': 'Help for this section',
  Novedades: 'What’s new',
  'No hay novedades por ahora.': 'No news yet.',
}
